import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async getUserPermissions(userId: number): Promise<string[]> {
    const permissions = await this.findPermissionsByUserId(userId);
    return permissions.map(permission => permission.name);
  }
  async findPermissionsByUserId(userId: number): Promise<Permission[]> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.roles', 'role')
      .innerJoin('role.users', 'user', 'user.id = :userId', { userId })
      .getMany();
  }
}
