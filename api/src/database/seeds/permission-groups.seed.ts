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
        permissionNames: [
          Permission.MANAGE_USERS,
          Permission.VIEW_USERS,
          Permission.MANAGE_ROLES,
        ],
      },
    ];
  }

  async seed(): Promise<void> {
    const groupsConfig = this.getPermissionGroupsConfig();
    let errorCount = 0;

    this.logger.log(
      `Starting permission groups seed. Groups to process: ${groupsConfig.length}`,
    );

    for (const groupConfig of groupsConfig) {
      try {
        this.logger.debug(`[1] Searching group: ${groupConfig.name}`);

        let group = await this.permissionGroupRepository.findOne({
          where: { name: groupConfig.name },
        });

        this.logger.debug(
          `[2] Group search completed. Exists: ${Boolean(group)}`,
        );

        if (!group) {
          this.logger.debug(`[3] Creating group: ${groupConfig.name}`);

          group = this.permissionGroupRepository.create({
            name: groupConfig.name,
            description: groupConfig.description,
          });

          this.logger.debug(`[4] Saving new group: ${groupConfig.name}`);

          group = await this.permissionGroupRepository.save(group);

          this.logger.debug(`[5] New group saved: ${groupConfig.name}`);
        } else if (group.description !== groupConfig.description) {
          this.logger.debug(
            `[3] Updating description for group: ${groupConfig.name}`,
          );

          group.description = groupConfig.description;

          group = await this.permissionGroupRepository.save(group);

          this.logger.debug(
            `[4] Group description updated: ${groupConfig.name}`,
          );
        }

        this.logger.debug(
          `[6] Searching permissions for group: ${groupConfig.name}`,
        );

        const permissions =
          groupConfig.permissionNames.length > 0
            ? await this.permissionRepository.find({
                where: groupConfig.permissionNames.map(name => ({ name })),
              })
            : [];

        this.logger.debug(
          `[7] Permissions found for "${groupConfig.name}": ${permissions.length}/${groupConfig.permissionNames.length}`,
        );

        const foundPermissionNames = new Set(
          permissions.map(permission => permission.name),
        );

        const missingPermissions = groupConfig.permissionNames.filter(
          name => !foundPermissionNames.has(name),
        );

        if (missingPermissions.length > 0) {
          this.logger.warn(
            `Permissions not found for "${groupConfig.name}": ${missingPermissions.join(', ')}`,
          );
        }

        this.logger.debug(
          `[8] Assigning permissions to group: ${groupConfig.name}`,
        );

        group.permissions = permissions;

        this.logger.debug(
          `[9] Saving group and permission relationships: ${groupConfig.name}`,
        );

        await this.permissionGroupRepository.save(group);

        this.logger.log(
          `Permission group processed successfully: ${groupConfig.name} (${permissions.length} permissions assigned)`,
        );
      } catch (error: unknown) {
        errorCount++;

        const errorMessage =
          error instanceof Error ? error.stack ?? error.message : String(error);

        this.logger.error(
          `Error seeding permission group "${groupConfig.name}": ${errorMessage}`,
        );
      }
    }

    if (errorCount > 0) {
      throw new Error(
        `Failed to seed ${errorCount} permission group(s). Check the preceding logs for details.`,
      );
    }

    this.logger.log('Permission groups seed completed successfully.');
  }

  async validate(): Promise<{ valid: boolean; missing: string[] }> {
    const expectedGroups = this.getPermissionGroupsConfig().map(
      group => group.name,
    );

    const existingGroups = await this.permissionGroupRepository.find({
      select: ['name'],
    });

    const existingNames = existingGroups.map(group => group.name);

    const missing = expectedGroups.filter(
      name => !existingNames.includes(name),
    );

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
