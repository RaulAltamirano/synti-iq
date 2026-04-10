import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { Permission as PermissionEntity } from 'src/permission/entities/permission.entity';
import { Permission } from 'src/shared/enums/permissions.enum';

interface PermissionGroupConfig {
  name: string;
  description: string;
  permissionNames: Permission[];
}

@Injectable()
export class PermissionGroupsSeed {
  private readonly logger = new Logger(PermissionGroupsSeed.name);

  constructor(
    @InjectRepository(PermissionGroup)
    private readonly permissionGroupRepository: Repository<PermissionGroup>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  private getPermissionGroupsConfig(): PermissionGroupConfig[] {
    return [
      {
        name: 'Sales Operations',
        description: 'Permissions for sales transactions and operations',
        permissionNames: [
          Permission.PROCESS_SALES,
          Permission.VOID_TRANSACTIONS,
          Permission.PROCESS_REFUNDS,
          Permission.APPLY_DISCOUNTS,
          Permission.VIEW_RECENT_RECEIPTS,
        ],
      },
      {
        name: 'Product Management',
        description: 'All permissions related to product operations',
        permissionNames: [
          Permission.VIEW_PRODUCTS,
          Permission.CREATE_PRODUCTS,
          Permission.UPDATE_PRODUCTS,
          Permission.DELETE_PRODUCTS,
          Permission.MANAGE_PRODUCTS,
          Permission.MANAGE_PRODUCT_PRICES,
        ],
      },
      {
        name: 'Inventory Management',
        description: 'Permissions for inventory operations',
        permissionNames: [Permission.MANAGE_INVENTORY],
      },
      {
        name: 'Reports',
        description: 'Permissions for viewing and exporting reports',
        permissionNames: [
          Permission.VIEW_REPORTS,
          Permission.VIEW_SALES_REPORTS,
          Permission.VIEW_INVENTORY_REPORTS,
          Permission.VIEW_FINANCIAL_REPORTS,
          Permission.EXPORT_REPORTS,
        ],
      },
      {
        name: 'User Administration',
        description: 'Permissions for managing users and roles',
        permissionNames: [Permission.MANAGE_USERS, Permission.VIEW_USERS, Permission.MANAGE_ROLES],
      },
    ];
  }

  async seed(): Promise<void> {
    const groupsConfig = this.getPermissionGroupsConfig();
    let errorCount = 0;

    for (const groupConfig of groupsConfig) {
      try {
        let group = await this.permissionGroupRepository.findOne({
          where: { name: groupConfig.name },
          relations: ['permissions'],
        });

        if (!group) {
          group = this.permissionGroupRepository.create({
            name: groupConfig.name,
            description: groupConfig.description,
          });
          await this.permissionGroupRepository.save(group);
        } else if (group.description !== groupConfig.description) {
          group.description = groupConfig.description;
          await this.permissionGroupRepository.save(group);
        }

        const permissions = await this.permissionRepository.find({
          where: groupConfig.permissionNames.map(name => ({ name })),
        });

        group.permissions = permissions;
        await this.permissionGroupRepository.save(group);
      } catch (error) {
        errorCount++;
        this.logger.error(`Error seeding permission group ${groupConfig.name}: ${error.message}`);
      }
    }

    if (errorCount > 0) {
      throw new Error(`Failed to seed ${errorCount} permission group(s)`);
    }
  }

  async validate(): Promise<{ valid: boolean; missing: string[] }> {
    const expectedGroups = this.getPermissionGroupsConfig().map(g => g.name);
    const existingGroups = await this.permissionGroupRepository.find({
      select: ['name'],
    });
    const existingNames = existingGroups.map(g => g.name);
    const missing = expectedGroups.filter(name => !existingNames.includes(name));

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
