import { Test, TestingModule } from '@nestjs/testing';
import { PermissionGroupController } from './permission-group.controller';
import { PermissionGroupService } from './permission-group.service';

describe('PermissionGroupController', () => {
  let controller: PermissionGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionGroupController],
      providers: [PermissionGroupService],
    }).compile();

    controller = module.get<PermissionGroupController>(PermissionGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
