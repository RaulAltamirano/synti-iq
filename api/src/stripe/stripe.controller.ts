
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorator';
import { StripeService } from './stripe.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ChangePlanDto } from './dto/change-plan.dto';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
  ) {}

  private getAuthenticatedUserId(req: any): string {
    const userId = req.user?.id ?? req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException(
        'No se pudo identificar al usuario autenticado.',
      );
    }

    return userId;
  }

  @ApiOperation({ summary: 'Obtener planes disponibles' })
  @Get('plans')
  getPlans() {
    return this.stripeService.getPlans();
  }

  @ApiOperation({ summary: 'Crear cliente en Stripe' })
  @Auth()
  @Post('customer')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.stripeService.createCustomer(dto.email);
  }

  @ApiOperation({
    summary: 'Actualizar dirección de facturación del cliente',
  })
  @Auth()
  @Post('update-address')
  updateAddress(
    @Body() dto: UpdateAddressDto,
    @Req() req: any,
  ) {
    const userId = this.getAuthenticatedUserId(req);

    return this.stripeService.updateCustomerAddress(
      dto.customerId,
      dto.locationId,
      userId,
    );
  }

  @ApiOperation({
    summary: 'Crear suscripción con dirección seleccionada',
  })
  @Auth()
  @Post('subscribe')
  subscribe(
    @Body() dto: SubscribeDto,
    @Req() req: any,
  ) {
    const userId = this.getAuthenticatedUserId(req);

    return this.stripeService.createSubscription(
      dto.customerId,
      dto.priceId,
      dto.locationId,
      userId,
    );
  }

  @ApiOperation({ summary: 'Obtener suscripciones activas' })
  @Auth()
  @Get('subscription/:customerId')
  getSubscription(
    @Param('customerId') customerId: string,
  ) {
    return this.stripeService.getSubscription(customerId);
  }

  @ApiOperation({ summary: 'Cancelar suscripción' })
  @Auth()
  @Post('cancel/:id')
  cancel(@Param('id') id: string) {
    return this.stripeService.cancelSubscription(id);
  }

  @ApiOperation({ summary: 'Cambiar plan de una suscripción' })
  @Auth()
  @Post('change-plan')
  changePlan(@Body() dto: ChangePlanDto) {
    return this.stripeService.changePlan(
      dto.subscriptionId,
      dto.newPriceId,
    );
  }

  // No lleva @Auth(): Stripe debe poder enviar el webhook.
  // En producción verifica la firma antes de procesar el evento.
  @Post('webhook')
  webhook(@Req() req: any) {
    return this.stripeService.handleWebhook(req.body);
  }
}
