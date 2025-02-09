import { Test, TestingModule } from '@nestjs/testing';
import { PermissionGroupService } from './permission-group.service';

describe('PermissionGroupService', () => {
  let service: PermissionGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionGroupService],
    }).compile();

    service = module.get<PermissionGroupService>(PermissionGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
