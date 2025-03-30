import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { CashierScheduleAssignment } from './entities/cashier-schedule-assignment.entity';
import { RecurringScheduleTemplate } from 'src/recurring-schedule-template/entities/recurring-schedule-template.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { Store } from 'src/store/entities/store.entity';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';

@Injectable()
export class CashierScheduleAssignmentService {
  private readonly logger = new Logger(CashierScheduleAssignmentService.name);

  // constructor(
  //   @InjectRepository(RecurringScheduleTemplate)
  //   private recurringTemplateRepository: Repository<RecurringScheduleTemplate>,
  //   @InjectRepository(TimeBlockTemplate)
  //   private timeBlockTemplateRepository: Repository<TimeBlockTemplate>,
  //   @InjectRepository(StoreSchedule)
  //   private storeScheduleRepository: Repository<StoreSchedule>,
  //   @InjectRepository(TimeBlock)
  //   private timeBlockRepository: Repository<TimeBlock>,
  //   @InjectRepository(CashierScheduleAssignment)
  //   private cashierAssignmentRepository: Repository<CashierScheduleAssignment>,
  //   @InjectRepository(Store)
  //   private storeRepository: Repository<Store>,
  // ) {}

  // /**
  //  * Genera horarios para la próxima semana basados en plantillas recurrentes
  //  * Se ejecuta automáticamente todos los domingos a las 23:00
  //  */
  // @Cron('0 23 * * 0')
  // async generateSchedulesForNextWeek() {
  //   this.logger.log('Generando horarios para la próxima semana...');

  //   // Obtener todas las tiendas activas
  //   const stores = await this.storeRepository.find({
  //     where: { isActive: true },
  //   });

  //   for (const store of stores) {
  //     await this.generateScheduleForStore(store.id);
  //   }

  //   this.logger.log('Generación de horarios completada.');
  // }

  // /**
  //  * Genera manualmente horarios para una tienda específica
  //  */
  // async generateScheduleForStore(
  //   storeId: string,
  //   startDate?: Date,
  //   days = 7,
  // ): Promise<void> {
  //   const start = startDate || this.getNextWeekStartDate();

  //   // Generar horarios para cada día
  //   for (let i = 0; i < days; i++) {
  //     const currentDate = new Date(start);
  //     currentDate.setDate(currentDate.getDate() + i);

  //     await this.generateDailySchedule(storeId, currentDate);
  //   }
  // }

  // /**
  //  * Obtiene la fecha de inicio de la próxima semana (lunes)
  //  */
  // private getNextWeekStartDate(): Date {
  //   const now = new Date();
  //   const daysUntilNextMonday = (8 - now.getDay()) % 7;
  //   const nextMonday = new Date(now);
  //   nextMonday.setDate(now.getDate() + daysUntilNextMonday);
  //   nextMonday.setHours(0, 0, 0, 0);
  //   return nextMonday;
  // }

  // /**
  //  * Genera el horario para un día específico en una tienda
  //  */
  // private async generateDailySchedule(
  //   storeId: string,
  //   date: Date,
  // ): Promise<void> {
  //   const dayOfWeek = date.getDay(); // 0 = domingo, 1 = lunes, etc.

  //   // Verificar si ya existe un horario para este día
  //   const existingSchedule = await this.storeScheduleRepository.findOne({
  //     where: {
  //       storeId,
  //       date: Between(
  //         new Date(date.setHours(0, 0, 0, 0)),
  //         new Date(date.setHours(23, 59, 59, 999)),
  //       ),
  //     },
  //   });

  //   if (existingSchedule) {
  //     this.logger.warn(
  //       `Ya existe un horario para ${date.toISOString()} en la tienda ${storeId}`,
  //     );
  //     return;
  //   }

  //   // Obtener el horario de operación de la tienda para este día
  //   const store = await this.storeRepository.findOne({
  //     where: { id: storeId },
  //   });
  //   const operatingHours = store.operatingHours[dayOfWeek];

  //   if (!operatingHours || !operatingHours.isOpen) {
  //     this.logger.log(
  //       `La tienda ${storeId} está cerrada el ${date.toISOString()}`,
  //     );
  //     return;
  //   }

  //   // Crear el horario de la tienda
  //   const storeSchedule = this.storeScheduleRepository.create({
  //     date,
  //     storeId,
  //     openTime: this.addTimeToDate(date, operatingHours.openTime),
  //     closeTime: this.addTimeToDate(date, operatingHours.closeTime),
  //     isPublished: false,
  //   });

  //   await this.storeScheduleRepository.save(storeSchedule);

  //   // Obtener plantillas recurrentes para este día de la semana
  //   const templates = await this.recurringTemplateRepository.find({
  //     where: {
  //       storeId,
  //       dayOfWeek,
  //       isActive: true,
  //       effectiveFrom: LessThanOrEqual(date),
  //       effectiveUntil: MoreThanOrEqual(date),
  //     },
  //     relations: ['timeBlockTemplates'],
  //   });

  //   // Generar bloques de tiempo a partir de las plantillas
  //   for (const template of templates) {
  //     for (const blockTemplate of template.timeBlockTemplates) {
  //       const startTime = this.addMinutesToDate(
  //         new Date(storeSchedule.openTime),
  //         blockTemplate.startTimeOffset,
  //       );

  //       const endTime = this.addMinutesToDate(
  //         new Date(storeSchedule.openTime),
  //         blockTemplate.endTimeOffset,
  //       );

  //       const timeBlock = this.timeBlockRepository.create({
  //         startTime,
  //         endTime,
  //         isAvailable: true,
  //         maxAssignments: blockTemplate.maxAssignments,
  //         storeScheduleId: storeSchedule.id,
  //         templateId: blockTemplate.id,
  //       });

  //       await this.timeBlockRepository.save(timeBlock);

  //       // Asignar automáticamente a los cajeros según la plantilla
  //       // Aquí se podría implementar la lógica para asignar basado en preferencias, skills, etc.
  //     }
  //   }
  // }

  // /**
  //  * Añade un tiempo en formato "HH:MM" a una fecha
  //  */
  // private addTimeToDate(date: Date, time: string): Date {
  //   const [hours, minutes] = time.split(':').map(Number);
  //   const result = new Date(date);
  //   result.setHours(hours, minutes, 0, 0);
  //   return result;
  // }

  // /**
  //  * Añade minutos a una fecha
  //  */
  // private addMinutesToDate(date: Date, minutes: number): Date {
  //   const result = new Date(date);
  //   result.setMinutes(result.getMinutes() + minutes);
  //   return result;
  // }
}
