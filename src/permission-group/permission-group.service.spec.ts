import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionGroupService } from './permission-group.service';
import { PermissionGroup } from './entities/permission-group.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';

describe('PermissionGroupService', () => {
  let service: PermissionGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGroupService,
        { provide: getRepositoryToken(PermissionGroup), useValue: {} },
        { provide: getRepositoryToken(Permission), useValue: {} },
        { provide: getRepositoryToken(Role), useValue: {} },
      ],
    }).compile();

    service = module.get<PermissionGroupService>(PermissionGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
