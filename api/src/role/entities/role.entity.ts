import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { SystemRole } from 'src/shared/enums/roles.enum';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: SystemRole, unique: true })
  name: SystemRole;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => PermissionGroup, { cascade: true })
  @JoinTable({
    name: 'role_groups',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' },
  })
  permissionGroups: PermissionGroup[];

  @OneToMany(() => User, user => user.role)
  users: User[];
}
