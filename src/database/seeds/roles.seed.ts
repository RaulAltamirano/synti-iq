import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { SystemRole } from 'src/shared/enums/roles.enum';

interface RoleConfig {
  name: SystemRole;
  description: string;
  permissionGroupNames: string[];
}

@Injectable()
export class RolesSeed {
  private readonly logger = new Logger(RolesSeed.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(PermissionGroup)
    private readonly permissionGroupRepository: Repository<PermissionGroup>,
  ) {}

  private getRolesConfig(): RoleConfig[] {
    return [
      {
        name: SystemRole.ADMIN,
        description: 'System administrator with full access',
        permissionGroupNames: [
          'Sales Operations',
          'Product Management',
          'Inventory Management',
          'Reports',
          'User Administration',
        ],
      },
      {
        name: SystemRole.MANAGER,
        description: 'Store manager with management permissions',
        permissionGroupNames: [
          'Sales Operations',
          'Product Management',
          'Inventory Management',
          'Reports',
        ],
      },
      {
        name: SystemRole.CASHIER,
        description: 'Cashier role for processing sales',
        permissionGroupNames: ['Sales Operations'],
      },
      {
        name: SystemRole.CUSTOMER,
        description: 'Customer role with limited access',
        permissionGroupNames: [],
      },
      {
        name: SystemRole.PROVIDER,
        description: 'Provider role for managing supplies',
        permissionGroupNames: ['Inventory Management'],
      },
      {
        name: SystemRole.DELIVERY,
        description: 'Delivery person role',
        permissionGroupNames: [],
      },
    ];
  }

  async seed(): Promise<void> {
    const rolesConfig = this.getRolesConfig();
    let errorCount = 0;

    for (const roleConfig of rolesConfig) {
      try {
        let role = await this.roleRepository.findOne({
          where: { name: roleConfig.name },
          relations: ['permissionGroups'],
        });

        if (!role) {
          role = this.roleRepository.create({
            name: roleConfig.name,
            description: roleConfig.description,
          });
          await this.roleRepository.save(role);
        } else if (role.description !== roleConfig.description) {
          role.description = roleConfig.description;
          await this.roleRepository.save(role);
        }

        const permissionGroups =
          roleConfig.permissionGroupNames.length > 0
            ? await this.permissionGroupRepository.find({
                where: roleConfig.permissionGroupNames.map(name => ({ name })),
              })
            : [];

        role.permissionGroups = permissionGroups;
        await this.roleRepository.save(role);
      } catch (error) {
        errorCount++;
        this.logger.error(`Error seeding role ${roleConfig.name}: ${error.message}`);
      }
    }

    if (errorCount > 0) {
      throw new Error(`Failed to seed ${errorCount} role(s)`);
    }
  }

  async validate(): Promise<{ valid: boolean; missing: string[] }> {
    const expectedRoles = this.getRolesConfig().map(r => r.name);
    const existingRoles = await this.roleRepository.find({
      select: ['name'],
    });
    const existingNames = existingRoles.map(r => r.name);
    const missing = expectedRoles.filter(name => !existingNames.includes(name));

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
