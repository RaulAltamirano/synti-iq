import { BusinessProfile } from 'src/business-profile/entities/business_profile.entity';
import { CashierProfile } from 'src/cashier-profile/entities/cashier_profile.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Location } from 'src/location/entities/location.entity';
import { PaymentMethod } from 'src/payment-method/entities/payment-method.entity';
import { RecurringScheduleTemplate } from 'src/recurring-schedule-template/entities/recurring-schedule-template.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('store')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: false })
  name: string;

  @OneToOne(() => Location, { eager: true, nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: Location | null;

  @Column({ name: 'business_profile_id', type: 'uuid' })
  businessProfileId: string;

  @ManyToOne(() => BusinessProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_profile_id' })
  businessProfile: BusinessProfile;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Inventory, inventory => inventory.store)
  inventoryItems: Inventory[];

  @OneToMany(() => Sale, sale => sale.store)
  sales: Sale[];

  @OneToMany(() => StoreSchedule, schedule => schedule.store, { cascade: ['insert'] })
  schedules: StoreSchedule[];

  @OneToMany(() => RecurringScheduleTemplate, template => template.store, {
    cascade: true,
  })
  recurringTemplates: RecurringScheduleTemplate[];

  @OneToMany(() => CashierProfile, cashier => cashier.store)
  cashiers: CashierProfile[];

  @ManyToMany(() => PaymentMethod, { cascade: true })
  @JoinTable({
    name: 'store_payment_methods',
    joinColumn: { name: 'store_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'payment_method_id',
      referencedColumnName: 'id',
    },
  })
  paymentMethods: PaymentMethod[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailySalesTarget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlySalesTarget: number;

  @Column({ nullable: true, length: 50 })
  storeType: string;
}
