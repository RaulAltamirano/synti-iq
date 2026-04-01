import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';
import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { User } from 'src/user/entities/user.entity';
import { PermissionService } from 'src/permission/permission.service';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: getRepositoryToken(Role), useValue: {} },
        { provide: getRepositoryToken(PermissionGroup), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        {
          provide: PermissionService,
          useValue: {
            invalidateUserPermissionsCacheForRoleId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
