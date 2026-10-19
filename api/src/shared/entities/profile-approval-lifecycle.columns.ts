import { Column } from 'typeorm';

/**
 * Shared approval + last-activity columns for operational profile tables.
 * DB columns are snake_case; TypeScript properties stay camelCase.
 * @see docs/CONVENTIONS.md — TypeORM Entities → Column naming
 */
export abstract class ProfileApprovalLifecycleColumns {
  @Column('boolean', { default: false, name: 'is_approved' })
  isApproved: boolean;

  @Column('timestamp with time zone', { nullable: true, name: 'approved_at' })
  approvedAt: Date | null;

  @Column('uuid', { nullable: true, name: 'approved_by' })
  approvedBy: string | null;

  @Column('timestamp with time zone', { nullable: true, name: 'last_activity_at' })
  lastActivityAt: Date | null;
}
