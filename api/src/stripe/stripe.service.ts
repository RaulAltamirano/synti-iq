
import axios from 'axios';
import * as qs from 'qs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Location } from '../location/entities/location.entity';

@Injectable()
export class StripeService {
  private readonly stripeApi = axios.create({
    baseURL: 'https://api.stripe.com/v1',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  // Obtener planes disponibles.
  async getPlans() {
    const res = await this.stripeApi.get('/prices', {
      params: {
        expand: ['data.product'],
        'recurring[interval]': 'month',
        active: true,
        limit: 100,
      },
    });

    return res.data.data;
  }

  // Crear cliente en Stripe.
  async createCustomer(email: string) {
    const res = await this.stripeApi.post(
      '/customers',
      qs.stringify({ email }),
    );

    return res.data;
  }

  // Obtener una dirección y verificar que pertenezca al usuario.
  private async getUserLocation(locationId: string, userId: string) {
    const location = await this.locationRepository.findOne({
      where: {
        id: locationId,
        user: { id: userId },
      },
    });

    if (!location) {
      throw new NotFoundException(
        'La dirección no existe o no pertenece al usuario autenticado.',
      );
    }

    if (!location.fullAddress?.trim()) {
      throw new BadRequestException(
        'La dirección seleccionada no tiene una dirección completa.',
      );
    }

    return location;
  }

  // Actualizar la dirección principal del cliente en Stripe.
  async updateCustomerAddress(
    customerId: string,
    locationId: string,
    userId: string,
  ) {
    const location = await this.getUserLocation(locationId, userId);

    const res = await this.stripeApi.post(
      `/customers/${customerId}`,
      qs.stringify({
        'address[line1]': location.fullAddress,
        'address[country]': 'MX',
      }),
    );

    return res.data;
  }

  // Actualizar la dirección asociada a una tarjeta guardada.
  async updatePaymentMethodAddress(
    paymentMethodId: string,
    locationId: string,
    userId: string,
  ) {
    const location = await this.getUserLocation(locationId, userId);

    const res = await this.stripeApi.post(
      `/payment_methods/${paymentMethodId}`,
      qs.stringify({
        'billing_details[address][line1]': location.fullAddress,
        'billing_details[address][country]': 'MX',
      }),
    );

    return res.data;
  }

  // Buscar el método de pago predeterminado del cliente.
  // Primero revisa el predeterminado del cliente y después
  // los métodos predeterminados de sus suscripciones activas.
  async getDefaultPaymentMethodId(
    customerId: string,
  ): Promise<string | null> {
    const customerRes = await this.stripeApi.get(
      `/customers/${customerId}`,
      {
        params: {
          expand: ['invoice_settings.default_payment_method'],
        },
      },
    );

    const customer = customerRes.data;
    const customerPaymentMethod =
      customer.invoice_settings?.default_payment_method;

    if (typeof customerPaymentMethod === 'string') {
      return customerPaymentMethod;
    }

    if (customerPaymentMethod?.id) {
      return customerPaymentMethod.id;
    }

    const subscriptionsRes = await this.stripeApi.get(
      '/subscriptions',
      {
        params: {
          customer: customerId,
          status: 'active',
          limit: 100,
        },
      },
    );

    for (const subscription of subscriptionsRes.data.data) {
      const paymentMethod = subscription.default_payment_method;

      if (typeof paymentMethod === 'string') {
        return paymentMethod;
      }

      if (paymentMethod?.id) {
        return paymentMethod.id;
      }
    }

    return null;
  }

  // Crear sesión de Checkout con la dirección seleccionada.
  async createSubscription(
    customerId: string,
    priceId: string,
    locationId: string,
    userId: string,
  ) {

    // 1. Bloquear si el cliente ya tiene una suscripción existente.
  await this.ensureNoExistingSubscription(customerId);
    // Validar la dirección antes de modificar datos en Stripe.
    const location = await this.getUserLocation(locationId, userId);

    // Actualizar la dirección principal del Customer.
    await this.updateCustomerAddress(
      customerId,
      locationId,
      userId,
    );

    // Buscar la tarjeta predeterminada, si existe.
    const paymentMethodId =
      await this.getDefaultPaymentMethodId(customerId);

    // Actualizar la dirección asociada a esa tarjeta.
    if (paymentMethodId) {
      await this.updatePaymentMethodAddress(
        paymentMethodId,
        locationId,
        userId,
      );
    }

    // Crear la sesión de Checkout.
    const res = await this.stripeApi.post(
      '/checkout/sessions',
      qs.stringify({
        mode: 'subscription',
        customer: customerId,

        // No obligar a capturar nuevamente la dirección.
        billing_address_collection: 'auto',

        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL,

        'line_items[0][price]': priceId,
        'line_items[0][quantity]': 1,

        // Registrar qué dirección eligió el usuario.
        'metadata[locationId]': location.id,
        'metadata[userId]': userId,
      }),
    );

    return res.data;
  }

  // Consultar suscripciones activas de un cliente.
  async getSubscription(customerId: string) {
    const res = await this.stripeApi.get('/subscriptions', {
      params: {
        customer: customerId,
        status: 'active',
      },
    });

    return res.data.data;
  }

  // Cancelar una suscripción.
  async cancelSubscription(subscriptionId: string) {
    const res = await this.stripeApi.delete(
      `/subscriptions/${subscriptionId}`,
    );

    return res.data;
  }

  // Cambiar el precio de una suscripción existente.
  async changePlan(
    subscriptionId: string,
    newPriceId: string,
  ) {
    const subscriptionRes = await this.stripeApi.get(
      `/subscriptions/${subscriptionId}`,
    );

    const subscription = subscriptionRes.data;
    const subscriptionItem = subscription.items?.data?.[0];

    if (!subscriptionItem) {
      throw new NotFoundException(
        'La suscripción no tiene elementos de precio.',
      );
    }

    const res = await this.stripeApi.post(
      `/subscriptions/${subscriptionId}`,
      qs.stringify({
        'items[0][id]': subscriptionItem.id,
        'items[0][price]': newPriceId,
        proration_behavior: 'create_prorations',
      }),
    );

    return res.data;
  }

  // Webhook básico.
  // Debes verificar la firma de Stripe antes de usarlo en producción.
  async handleWebhook(event: any) {
    if (event.type === 'invoice.payment_succeeded') {
      console.log('Pago de factura exitoso');
    }

    if (event.type === 'customer.subscription.deleted') {
      console.log('Suscripción cancelada');
    }

    return { received: true };
  }
  
private async ensureNoExistingSubscription(
  customerId: string,
): Promise<void> {
  const blockingStatuses = new Set([
    'active',
    'trialing',
    'past_due',
    'unpaid',
    'incomplete',
    'paused',
  ]);

  let startingAfter: string | undefined;

  while (true) {
    const params: Record<string, string | number> = {
      customer: customerId,
      status: 'all',
      limit: 100,
    };

    if (startingAfter) {
      params.starting_after = startingAfter;
    }

    const response = await this.stripeApi.get('/subscriptions', {
      params,
    });

    const subscriptions = response.data.data;

    const existingSubscription = subscriptions.find(
      (subscription: { status: string }) =>
        blockingStatuses.has(subscription.status),
    );

    if (existingSubscription) {
      throw new ConflictException({
        statusCode: 409,
        message:
          'Ya tienes un plan contratado. No puedes contratar otro mientras tu suscripción actual siga vigente o pendiente.',
        subscriptionId: existingSubscription.id,
        subscriptionStatus: existingSubscription.status,
      });
    }

    if (!response.data.has_more || subscriptions.length === 0) {
      break;
    }

    startingAfter = subscriptions[subscriptions.length - 1].id;
  }
}

}
