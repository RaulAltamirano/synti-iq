import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionStatus } from './enums/subscription-status.enum';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly DEFAULT_TRIAL_DAYS = 14;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async createForCustomer(customerProfileId: string, trialDays?: number): Promise<Subscription> {
    const days = trialDays || this.DEFAULT_TRIAL_DAYS;
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + days);

    const subscription = this.subscriptionRepository.create({
      customerId: customerProfileId,
      status: SubscriptionStatus.TRIALING,
      trialStart: now,
      trialEnd: trialEnd,
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      cancelAtPeriodEnd: false,
    });

    const saved = await this.subscriptionRepository.save(subscription);
    this.logger.log(
      `Created subscription ${saved.id} for customer ${customerProfileId} with ${days} days trial`,
    );
    return saved;
  }

  async findByCustomerId(customerProfileId: string): Promise<Subscription | null> {
    return await this.subscriptionRepository.findOne({
      where: { customerId: customerProfileId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Subscription | null> {
    return await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['customer'],
    });
  }

  async updateStatus(subscriptionId: string, status: SubscriptionStatus): Promise<Subscription> {
    const subscription = await this.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    subscription.status = status;
    return await this.subscriptionRepository.save(subscription);
  }

  async update(subscriptionId: string, data: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    Object.assign(subscription, data);
    return await this.subscriptionRepository.save(subscription);
  }

  async checkTrialExpiration(subscriptionId: string): Promise<boolean> {
    const subscription = await this.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    if (!subscription.trialEnd) {
      return false;
    }

    return new Date() > subscription.trialEnd;
  }

  async requirePaymentMethod(subscriptionId: string): Promise<boolean> {
    const subscription = await this.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    const trialExpired = await this.checkTrialExpiration(subscriptionId);
    const isTrialing = subscription.status === SubscriptionStatus.TRIALING;

    return trialExpired && isTrialing;
  }
}
