import { Test, TestingModule } from '@nestjs/testing';
import { DefaultProfileService } from './default_profile.service';

describe('DefaultProfileService', () => {
  let service: DefaultProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefaultProfileService],
    }).compile();

    service = module.get<DefaultProfileService>(DefaultProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
