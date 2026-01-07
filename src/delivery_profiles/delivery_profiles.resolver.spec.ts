import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryProfilesResolver } from './delivery_profiles.resolver';
import { DeliveryProfilesService } from './delivery_profiles.service';

describe('DeliveryProfilesResolver', () => {
  let resolver: DeliveryProfilesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryProfilesResolver, DeliveryProfilesService],
    }).compile();

    resolver = module.get<DeliveryProfilesResolver>(DeliveryProfilesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
