import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import { Repository, EntityManager } from 'typeorm';
import { CashierScheduleAssignment } from './entities/cashier-schedule-assignment.entity';
import { AssignmentStatus } from './enums/assignment-status.dto';
import {
  CommandHistory,
  CreateAssignmentCommand,
  SwapShiftCommand,
} from './implementations/command-implementations';

@Injectable()
export class CashierScheduleAssignmentService {
  private readonly logger = new Logger(CashierScheduleAssignmentService.name);
  private commandHistory: CommandHistory = new CommandHistory();

  constructor(
    @InjectRepository(CashierScheduleAssignment)
    private assignmentRepository: Repository<CashierScheduleAssignment>,
    @InjectRepository(TimeBlock)
    private timeBlockRepository: Repository<TimeBlock>,
    private entityManager: EntityManager,
  ) {}

  /**
   * Verifica si un cajero está disponible para un nuevo bloque de tiempo
   * validando que no haya solapamientos con sus asignaciones existentes
   */
  async isCashierAvailable(
    cashierId: string,
    startTime: Date,
    endTime: Date,
    excludeAssignmentId?: string,
  ): Promise<boolean> {
    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .innerJoin('assignment.timeBlock', 'timeBlock')
      .where('assignment.cashierId = :cashierId', { cashierId })
      .andWhere('assignment.status IN (:...activeStatuses)', {
        activeStatuses: [
          AssignmentStatus.SCHEDULED,
          AssignmentStatus.SWAP_REQUESTED,
        ],
      })
      .andWhere(
        '(timeBlock.startTime < :endTime AND timeBlock.endTime > :startTime)',
        { startTime, endTime },
      );

    if (excludeAssignmentId) {
      query.andWhere('assignment.id != :excludeAssignmentId', {
        excludeAssignmentId,
      });
    }

    const overlappingAssignments = await query.getCount();
    return overlappingAssignments === 0;
  }

  /**
   * Crea una nueva asignación de horario para un cajero usando el patrón Command
   */
  async createAssignment(dto: any): Promise<CashierScheduleAssignment> {
    const command = new CreateAssignmentCommand(
      {
        timeBlockId: dto.timeBlockId,
        cashierId: dto.cashierId,
        recurringTemplateId: dto.recurringTemplateId,
      },
      this.entityManager,
    );

    try {
      await command.execute();
      this.commandHistory.push(command);
      return command.getResult();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Solicita un intercambio de turno entre cajeros
   */
  async requestShiftSwap(
    dto: any,
  ): Promise<{ success: boolean; message: string }> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const originalAssignment = await transactionalEntityManager.findOne(
          CashierScheduleAssignment,
          {
            where: { id: dto.assignmentId },
            relations: ['timeBlock', 'cashier'],
          },
        );

        if (!originalAssignment) {
          return {
            success: false,
            message: 'La asignación original no existe',
          };
        }

        const isAvailable = await this.isCashierAvailable(
          dto.requestedCashierId,
          originalAssignment.timeBlock.startTime,
          originalAssignment.timeBlock.endTime,
        );

        if (!isAvailable) {
          return {
            success: false,
            message: 'El cajero solicitado no está disponible en ese horario',
          };
        }

        originalAssignment.status = AssignmentStatus.SWAP_REQUESTED;
        originalAssignment.swapRequestedWithId = dto.requestedCashierId;
        originalAssignment.reason = dto.reason;

        await transactionalEntityManager.save(originalAssignment);

        // Aquí se podría implementar el envío de notificaciones

        return {
          success: true,
          message: 'Solicitud de intercambio enviada correctamente',
        };
      },
    );
  }

  /**
   * Confirma y ejecuta un intercambio de turno usando el patrón Command
   */
  async confirmShiftSwap(
    assignmentId: string,
  ): Promise<{ success: boolean; message: string }> {
    const assignment = await this.assignmentRepository.findOne({
      where: {
        id: assignmentId,
        status: AssignmentStatus.SWAP_REQUESTED,
      },
      relations: ['timeBlock'],
    });

    if (!assignment || !assignment.swapRequestedWithId) {
      return {
        success: false,
        message: 'Solicitud de intercambio no encontrada',
      };
    }

    const command = new SwapShiftCommand(
      assignmentId,
      assignment.swapRequestedWithId,
      `Intercambio confirmado desde ${assignment.cashierId}`,
      this.entityManager,
    );

    try {
      await command.execute();
      this.commandHistory.push(command);
      return {
        success: true,
        message: 'Intercambio de turno completado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al procesar el intercambio: ${error.message}`,
      };
    }
  }

  /**
   * Deshace la última operación realizada (usando el patrón Command)
   */
  async undoLastOperation(): Promise<{ success: boolean; message: string }> {
    try {
      await this.commandHistory.undo();
      return {
        success: true,
        message: 'Operación deshecha correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al deshacer operación: ${error.message}`,
      };
    }
  }

  /**
   * Obtiene las asignaciones actuales de un cajero
   */
  // async getCashierAssignments(
  //   cashierId: string,
  //   startDate: Date,
  //   endDate: Date,
  // ): Promise<CashierScheduleAssignment[]> {
  //   return this.assignmentRepository.find({
  //     where: {
  //       cashierId,
  //       status: AssignmentStatus.SCHEDULED,
  //     },
  //     relations: ['timeBlock'],
  //     order: {
  //       'timeBlock.startTime': 'ASC',
  //     },
  //   });
  // }
}
