import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfileService } from './customer_profile.service';
import { CustomerProfile } from './entities/customer_profile.entity';

describe('CustomerProfileService', () => {
  let service: CustomerProfileService;
  let repository: Repository<CustomerProfile>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerProfileService,
        {
          provide: getRepositoryToken(CustomerProfile),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerProfileService>(CustomerProfileService);
    repository = module.get<Repository<CustomerProfile>>(getRepositoryToken(CustomerProfile));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a customer profile', async () => {
    const mockProfile = { id: 'test-id' } as CustomerProfile;
    mockRepository.create.mockReturnValue(mockProfile);
    mockRepository.save.mockResolvedValue(mockProfile);

    const result = await service.create();

    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result).toEqual(mockProfile);
  });

  it('should find customer profile by id', async () => {
    const mockProfile = { id: 'test-id' } as CustomerProfile;
    mockRepository.findOne.mockResolvedValue(mockProfile);

    const result = await service.findById('test-id');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'test-id' },
      relations: ['subscriptions'],
    });
    expect(result).toEqual(mockProfile);
  });
});
