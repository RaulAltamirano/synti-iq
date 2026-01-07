import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => PermissionGroup, { cascade: true })
  @JoinTable({
    name: 'role_groups',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' },
  })
  permissionGroups: PermissionGroup[];

  @OneToMany(() => UserRole, userRole => userRole.role)
  users: User[];
}
