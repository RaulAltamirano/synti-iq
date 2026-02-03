import { Test, TestingModule } from '@nestjs/testing';
import { DefaultProfileController } from './default_profile.controller';
import { DefaultProfileService } from './default_profile.service';

describe('DefaultProfileController', () => {
  let controller: DefaultProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefaultProfileController],
      providers: [DefaultProfileService],
    }).compile();

    controller = module.get<DefaultProfileController>(DefaultProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
