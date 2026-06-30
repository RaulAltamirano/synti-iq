import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionStatus } from './enums/subscription-status.enum';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repository: Repository<Subscription>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repository = module.get<Repository<Subscription>>(getRepositoryToken(Subscription));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create subscription for customer with default trial', async () => {
    const customerId = 'customer-id';
    const trialStart = new Date('2026-01-01T00:00:00.000Z');
    const trialEnd = new Date('2026-01-08T00:00:00.000Z');
    const mockSubscription = {
      id: 'sub-id',
      customerId,
      status: SubscriptionStatus.TRIALING,
      trialStart,
      trialEnd,
    } as Subscription;

    mockRepository.create.mockReturnValue(mockSubscription);
    mockRepository.save.mockResolvedValue(mockSubscription);

    const result = await service.createForCustomer(customerId);

    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result.status).toBe(SubscriptionStatus.TRIALING);
    expect(result.trialStart).toBeInstanceOf(Date);
    expect(result.trialEnd).toBeInstanceOf(Date);
  });

  it('should create subscription with custom trial days', async () => {
    const customerId = 'customer-id';
    const trialDays = 30;
    const mockSubscription = {
      id: 'sub-id',
      customerId,
      status: SubscriptionStatus.TRIALING,
    } as Subscription;

    mockRepository.create.mockReturnValue(mockSubscription);
    mockRepository.save.mockResolvedValue(mockSubscription);

    const result = await service.createForCustomer(customerId, trialDays);

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should find subscription by customer id', async () => {
    const customerId = 'customer-id';
    const mockSubscription = { id: 'sub-id', customerId } as Subscription;

    mockRepository.findOne.mockResolvedValue(mockSubscription);

    const result = await service.findByCustomerId(customerId);

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual(mockSubscription);
  });
});
