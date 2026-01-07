import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryProfilesService } from './delivery_profiles.service';

describe('DeliveryProfilesService', () => {
  let service: DeliveryProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryProfilesService],
    }).compile();

    service = module.get<DeliveryProfilesService>(DeliveryProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
