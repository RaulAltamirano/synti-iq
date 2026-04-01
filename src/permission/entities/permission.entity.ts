import { PermissionGroup } from 'src/permission-group/entities/permission-group.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => PermissionGroup, group => group.permissions)
  groups: PermissionGroup[];
}
