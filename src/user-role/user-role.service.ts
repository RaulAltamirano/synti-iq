import { Injectable, Logger } from '@nestjs/common';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class UserRoleService {
  private readonly logger = new Logger(UserRoleService.name);

  constructor(private readonly roleRepository: RoleService) {}
  async getUserRoles(userId: number): Promise<string[]> {
    const roles = await this.roleRepository.findRolesByUserId(userId);
    return roles.map((role: Role) => role.name);
  }
}
