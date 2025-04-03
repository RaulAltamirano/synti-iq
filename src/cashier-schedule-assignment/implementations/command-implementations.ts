import { EntityManager } from 'typeorm';
import { ScheduleCommand } from '../interface/schedule-command.interface';
import { CashierScheduleAssignment } from '../entities/cashier-schedule-assignment.entity';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import { AssignmentStatus } from '../enums/assignment-status.dto';

export class CommandHistory {
  private commands: ScheduleCommand[] = [];

  push(command: ScheduleCommand): void {
    this.commands.push(command);
  }

  async undo(): Promise<void> {
    const command = this.commands.pop();
    if (command) {
      await command.undo();
    }
  }
}

export class CreateAssignmentCommand implements ScheduleCommand {
  getResult():
    | CashierScheduleAssignment
    | PromiseLike<CashierScheduleAssignment> {
    throw new Error('Method not implemented.');
  }
  private result: CashierScheduleAssignment;

  constructor(
    private readonly data: {
      timeBlockId: string;
      cashierId: string;
      recurringTemplateId?: string;
    },
    private readonly entityManager: EntityManager,
  ) {}

  async execute(): Promise<void> {
    // Validar disponibilidad del cajero
    const timeBlock = await this.entityManager.findOne(TimeBlock, {
      where: { id: this.data.timeBlockId },
    });

    if (!timeBlock) {
      throw new Error('Bloque de tiempo no encontrado');
    }

    // const isAvailable = await isCashierAvailable(
    //   this.data.cashierId,
    //   timeBlock.startTime,
    //   timeBlock.endTime,
    //   this.entityManager,
    // );

    // if (!isAvailable) {
    //   throw new Error('El cajero no está disponible en este horario');
    // }

    // Crear asignación
    const assignment = new CashierScheduleAssignment();
    assignment.timeBlockId = this.data.timeBlockId;
    assignment.cashierId = this.data.cashierId;
    assignment.recurringTemplateId = this.data.recurringTemplateId;
    assignment.status = AssignmentStatus.SCHEDULED;

    this.result = await this.entityManager.save(assignment);
  }

  async undo(): Promise<void> {
    if (this.result && this.result.id) {
      await this.entityManager.update(
        CashierScheduleAssignment,
        { id: this.result.id },
        { status: AssignmentStatus.CANCELLED },
      );
    }
  }
}
export class SwapShiftCommand implements ScheduleCommand {
  private originalStatus: AssignmentStatus;
  private createdAssignmentId: string;

  constructor(
    private readonly assignmentId: string,
    private readonly targetCashierId: string,
    private readonly reason: string,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(): Promise<void> {
    const assignment = await this.entityManager.findOne(
      CashierScheduleAssignment,
      {
        where: { id: this.assignmentId },
        relations: ['timeBlock'],
      },
    );

    if (!assignment) {
      throw new Error('Asignación no encontrada');
    }

    // Guardar estado original para poder revertir
    this.originalStatus = assignment.status;

    // Verificar disponibilidad
    // const isAvailable = await isCashierAvailable(
    //   this.targetCashierId,
    //   assignment.timeBlock.startTime,
    //   assignment.timeBlock.endTime,
    //   this.entityManager,
    // );

    // if (!isAvailable) {
    //   throw new Error('El cajero solicitado no está disponible');
    // }

    // Crear nueva asignación
    const newAssignment = new CashierScheduleAssignment();
    newAssignment.timeBlockId = assignment.timeBlockId;
    newAssignment.cashierId = this.targetCashierId;
    newAssignment.status = AssignmentStatus.SCHEDULED;
    newAssignment.reason = `Intercambio desde ${assignment.cashierId}, motivo: ${this.reason}`;

    const saved = await this.entityManager.save(newAssignment);
    this.createdAssignmentId = saved.id;

    // Actualizar estado de la asignación original
    assignment.status = AssignmentStatus.CANCELLED;
    assignment.reason = `Intercambiado con ${this.targetCashierId}, motivo: ${this.reason}`;

    await this.entityManager.save(assignment);
  }

  async undo(): Promise<void> {
    // Revertir la asignación original a su estado anterior
    await this.entityManager.update(
      CashierScheduleAssignment,
      { id: this.assignmentId },
      { status: this.originalStatus, reason: null },
    );

    // Cancelar la nueva asignación creada
    if (this.createdAssignmentId) {
      await this.entityManager.update(
        CashierScheduleAssignment,
        { id: this.createdAssignmentId },
        { status: AssignmentStatus.CANCELLED, reason: 'Intercambio revertido' },
      );
    }
  }
}
