import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission as PermissionEntity } from 'src/permission/entities/permission.entity';
import { Permission, PERMISSION_METADATA } from 'src/shared/enums/permissions.enum';

@Injectable()
export class PermissionsSeed {
  private readonly logger = new Logger(PermissionsSeed.name);

  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async seed(): Promise<void> {
    const permissionsToCreate = Object.values(Permission);
    let errorCount = 0;

    for (const permissionName of permissionsToCreate) {
      try {
        const metadata = PERMISSION_METADATA[permissionName as Permission];
        const existingPermission = await this.permissionRepository.findOne({
          where: { name: permissionName },
        });

        if (existingPermission) {
          if (existingPermission.description !== metadata.description) {
            existingPermission.description = metadata.description;
            await this.permissionRepository.save(existingPermission);
          }
          continue;
        }

        const permission = this.permissionRepository.create({
          name: permissionName,
          description: metadata.description,
        });

        await this.permissionRepository.save(permission);
      } catch (error) {
        errorCount++;
        this.logger.error(`Error seeding permission ${permissionName}: ${error.message}`);
      }
    }

    if (errorCount > 0) {
      throw new Error(`Failed to seed ${errorCount} permission(s)`);
    }
  }

  getExpectedPermissions(): string[] {
    return Object.values(Permission);
  }

  async validate(): Promise<{ valid: boolean; missing: string[] }> {
    const expectedPermissions = this.getExpectedPermissions();
    const existingPermissions = await this.permissionRepository.find({
      select: ['name'],
    });
    const existingNames = existingPermissions.map(p => p.name);
    const missing = expectedPermissions.filter(name => !existingNames.includes(name));

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
