import { Injectable, Logger, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import { Repository, EntityManager } from 'typeorm';
import { CashierScheduleAssignment } from './entities/cashier-schedule-assignment.entity';
import { AssignmentStatus } from './enums/assignment-status.dto';
import { CreateAssignmentDto, RequestShiftSwapDto } from './dto/create-assignment.dto';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { AssignmentFilterDto } from './dto/assignment-filter.dto';
import { PaginationCacheUtil } from 'src/pagination/utils/PaginationCacheUtil';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CashierScheduleAssignmentRepository } from './repositories/cashier-schedule-assignment.repository';
import { AssignmentFactory } from './factories/assignment.factory';
import { Type } from 'class-transformer';
import { IsDate, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Counter, Histogram } from 'prom-client';
import { TimeBlockTemplateService } from 'src/time-block-template/time-block-template.service';
import { TimeBlockService } from 'src/time-block/time-block.service';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

/**
 * DTO para crear una asignación de horario
 */
export class CreateTimeBlockAndAssignDto {
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsString()
  storeScheduleId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAssignments?: number;

  @IsString()
  cashierId: string;

  @IsString()
  storeId: string;
}

/**
 * Servicio para gestionar las asignaciones de horarios de cajeros
 */
@Injectable()
export class CashierScheduleAssignmentService {
  private readonly CACHE_PREFIX = 'assignments_list';
  private readonly logger = new Logger(CashierScheduleAssignmentService.name);
  private timeOffsetCache = new Map<string, number>();

  // Métricas de Prometheus
  private readonly metrics = {
    assignmentCreation: new Counter({
      name: 'assignment_creation_total',
      help: 'Total number of assignment creations'
    }),
    assignmentErrors: new Counter({
      name: 'assignment_errors_total',
      help: 'Total number of assignment errors'
    }),
    operationDuration: new Histogram({
      name: 'operation_duration_seconds',
      help: 'Duration of operations in seconds',
      buckets: [0.1, 0.5, 1, 2, 5]
    })
  };

  // Configuración de cache
  private readonly CACHE_TTL = {
    ASSIGNMENTS: 300,
    AVAILABILITY: 60,
    TEMPLATES: 3600
  };

  constructor(
    private readonly timeBlockService: TimeBlockService,
    private readonly timeBlockTemplateService: TimeBlockTemplateService,
    private entityManager: EntityManager,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly assignmentRepository: CashierScheduleAssignmentRepository,
    private readonly assignmentFactory: AssignmentFactory,
  ) {}

  /**
   * Crea un nuevo bloque de tiempo y lo asigna a un cajero en una sola transacción
   */
  async createTimeBlockAndAssign(
    dto: CreateAssignmentDto,
  ): Promise<CashierScheduleAssignment> {
    const timer = this.metrics.operationDuration.startTimer();
    try {
      this.validateCreateAssignmentDto(dto);

      // Verificar que el horario de la tienda existe
      const storeSchedule = await this.entityManager.findOne(StoreSchedule, {
        where: { id: dto.storeScheduleId },
      });

      if (!storeSchedule) {
        throw new NotFoundException(`Store schedule with id ${dto.storeScheduleId} not found`);
      }

      // Verificar disponibilidad del cajero
      const isAvailable = await this.checkCashierAvailability(
        dto.cashierId,
        dto.startTime,
        dto.endTime
      );

      if (!isAvailable) {
        throw new BadRequestException('Cashier is not available during this time block');
      }

      // Crear o obtener template y bloque de tiempo en una transacción
      return await this.entityManager.transaction(async (transactionalEntityManager) => {
        const timeBlockTemplate = await this.getOrCreateTimeBlockTemplate(dto);
        const timeBlock = await this.createTimeBlock(dto, timeBlockTemplate);
        
        const assignmentDto: CreateAssignmentDto = {
          ...dto,
          timeBlockId: timeBlock.id,
        };

        const assignment = this.assignmentFactory.createAssignment(assignmentDto);
        const result = await this.assignmentRepository.save(assignment);
        
        this.metrics.assignmentCreation.inc();
        return result;
      });
    } catch (error) {
      this.metrics.assignmentErrors.inc();
      this.logger.error(`Error creating time block and assignment: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to create time block and assignment: ${error.message}`);
    } finally {
      timer();
    }
  }

  /**
   * Verifica la disponibilidad de un cajero con cache
   */
  private async checkCashierAvailability(
    cashierId: string,
    startTime: Date,
    endTime: Date,
    excludeAssignmentId?: string
  ): Promise<boolean> {
    const cacheKey = `availability:${cashierId}:${startTime.toISOString()}:${endTime.toISOString()}:${excludeAssignmentId || ''}`;
    const cached = await this.cacheManager.get<boolean>(cacheKey);
    
    if (cached !== undefined) {
      return cached;
    }

    const overlapping = await this.assignmentRepository.findOverlappingAssignments(
      cashierId,
      startTime,
      endTime,
      excludeAssignmentId
    );

    const isAvailable = overlapping === 0;
    await this.cacheManager.set(cacheKey, isAvailable, this.CACHE_TTL.AVAILABILITY);
    return isAvailable;
  }

  /**
   * Solicita un intercambio de turno entre cajeros
   */
  async requestShiftSwap(
    dto: RequestShiftSwapDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.validateRequestShiftSwapDto(dto);

      return this.entityManager.transaction(async (transactionalEntityManager) => {
        const originalAssignment = await this.assignmentRepository.findById(dto.assignmentId);

        if (!originalAssignment) {
          return {
            success: false,
            message: 'Original assignment does not exist',
          };
        }

        if (originalAssignment.status !== AssignmentStatus.SCHEDULED) {
          return {
            success: false,
            message: `Assignment is in ${originalAssignment.status} status and cannot be swapped`,
          };
        }

        const isAvailable = await this.assignmentRepository.findOverlappingAssignments(
          dto.requestedCashierId,
          originalAssignment.actualStartTime,
          originalAssignment.actualEndTime,
        );

        if (isAvailable > 0) {
          return {
            success: false,
            message: 'Requested cashier is not available during this time block',
          };
        }

        const updatedAssignment = this.assignmentFactory.createSwapRequest(
          originalAssignment,
          dto.requestedCashierId,
          dto.reason,
        );

        await this.assignmentRepository.save(updatedAssignment);

        return {
          success: true,
          message: 'Shift swap request sent successfully',
        };
      });
    } catch (error) {
      this.logger.error(`Error requesting shift swap: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to request shift swap: ${error.message}`);
    }
  }

  /**
   * Confirma y ejecuta un intercambio de turno usando el patrón Command
   */
  async confirmShiftSwap(
    assignmentId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!assignmentId) {
        throw new BadRequestException('assignmentId is required');
      }

      const assignment = await this.assignmentRepository.findByStatusAndId(
        assignmentId,
        AssignmentStatus.SWAP_REQUESTED,
      );

      if (!assignment) {
        return {
          success: false,
          message: 'Swap request not found or not in SWAP_REQUESTED status',
        };
      }

      if (!assignment.swapRequestedWithId) {
        return {
          success: false,
          message: 'No target cashier specified for this swap request',
        };
      }

      const isStillAvailable = await this.assignmentRepository.findOverlappingAssignments(
        assignment.swapRequestedWithId,
        assignment.actualStartTime,
        assignment.actualEndTime,
      );

      if (isStillAvailable > 0) {
        return {
          success: false,
          message: 'Target cashier is no longer available during this time block',
        };
      }

      await this.assignmentRepository.updateStatus(
        assignmentId,
        AssignmentStatus.SCHEDULED,
        assignment.swapRequestedWithId,
        `Swap confirmed from ${assignment.cashierId}`,
      );

      return {
        success: true,
        message: 'Shift swap completed successfully',
      };
    } catch (error) {
      this.logger.error(`Error confirming shift swap: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Error processing swap: ${error.message}`,
      };
    }
  }

  /**
   * Obtiene las asignaciones actuales de un cajero
   */
  async getCashierAssignments(
    cashierId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CashierScheduleAssignment[]> {
    try {
      return this.assignmentRepository.findCashierAssignments(cashierId, startDate, endDate);
    } catch (error) {
      this.logger.error(`Error getting cashier assignments: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to get cashier assignments: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las asignaciones con filtros y paginación optimizada
   */
  async findAll(filters: AssignmentFilterDto): Promise<PaginatedResponse<CashierScheduleAssignment>> {
    const timer = this.metrics.operationDuration.startTimer();
    try {
      const cacheKey = PaginationCacheUtil.buildCacheKey(this.CACHE_PREFIX, filters);
      const cachedResult = await this.cacheManager.get<PaginatedResponse<CashierScheduleAssignment>>(cacheKey);
      
      if (cachedResult) {
        return cachedResult;
      }

      const queryBuilder = this.assignmentRepository
        .createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.timeBlock', 'timeBlock')
        .leftJoinAndSelect('assignment.storeSchedule', 'storeSchedule')
        .select([
          'assignment.id',
          'assignment.cashierId',
          'assignment.startTime',
          'assignment.endTime',
          'assignment.status',
          'timeBlock.id',
          'storeSchedule.id'
        ]);

      if (filters.cashierId) {
        queryBuilder.andWhere('assignment.cashierId = :cashierId', { cashierId: filters.cashierId });
      }

      if (filters.startDate) {
        queryBuilder.andWhere('assignment.startTime >= :startDate', { startDate: filters.startDate });
      }

      if (filters.endDate) {
        queryBuilder.andWhere('assignment.endTime <= :endDate', { endDate: filters.endDate });
      }

      const [assignments, total] = await queryBuilder
        .skip((filters.page - 1) * filters.limit)
        .take(filters.limit)
        .getManyAndCount();

      const response = PaginationCacheUtil.createPaginatedResponse<CashierScheduleAssignment>({
        data: assignments,
        total,
        page: filters.page,
        limit: filters.limit,
      });

      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL.ASSIGNMENTS);
      return response;
    } catch (error) {
      this.metrics.assignmentErrors.inc();
      this.logger.error(`Error getting assignments: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to get assignments: ${error.message}`);
    } finally {
      timer();
    }
  }

  /**
   * Obtiene una asignación por su ID
   */
  async findOne(id: string): Promise<CashierScheduleAssignment> {
    try {
      const assignment = await this.assignmentRepository.findById(id);

      if (!assignment) {
        throw new NotFoundException(`Assignment with id ${id} not found`);
      }

      return assignment;
    } catch (error) {
      this.logger.error(`Error finding assignment: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualiza una asignación existente y opcionalmente sus bloques futuros
   */
  async updateAssignment(
    id: string,
    updateDto: UpdateAssignmentDto,
  ): Promise<CashierScheduleAssignment> {
    const timer = this.metrics.operationDuration.startTimer();
    try {
      const assignment = await this.findOne(id);
      if (!assignment) {
        throw new NotFoundException(`Assignment with id ${id} not found`);
      }

      // Verificar disponibilidad si se está cambiando el horario
      if (updateDto.startTime && updateDto.endTime) {
        const isAvailable = await this.checkCashierAvailability(
          updateDto.cashierId || assignment.cashierId,
          updateDto.startTime,
          updateDto.endTime,
          id
        );

        if (!isAvailable) {
          throw new BadRequestException('Cashier is not available during this time block');
        }
      }

      return await this.entityManager.transaction(async (transactionalEntityManager) => {
        // Actualizar el bloque de tiempo
        const timeBlock = await transactionalEntityManager.findOne(TimeBlock, {
          where: { id: assignment.timeBlockId },
          relations: ['template'],
        });

        if (!timeBlock) {
          throw new NotFoundException(`Time block with id ${assignment.timeBlockId} not found`);
        }

        // Si hay cambios en el horario y se debe actualizar bloques futuros
        if (updateDto.updateFutureBlocks && timeBlock.template) {
          const fromDate = updateDto.updateFromDate || new Date();
          
          // Actualizar la plantilla
          const templateUpdates = {
            startTimeOffset: updateDto.startTime ? this.calculateTimeOffset(updateDto.startTime) : undefined,
            endTimeOffset: updateDto.endTime ? this.calculateTimeOffset(updateDto.endTime) : undefined,
            maxAssignments: updateDto.maxAssignments,
          };

          await this.timeBlockTemplateService.updateTemplate(
            timeBlock.template.id,
            templateUpdates,
            true // regenerateFutureBlocks
          );
        }

        // Actualizar el bloque de tiempo actual
        if (updateDto.startTime) timeBlock.startTime = updateDto.startTime;
        if (updateDto.endTime) timeBlock.endTime = updateDto.endTime;
        if (updateDto.maxAssignments) timeBlock.maxAssignments = updateDto.maxAssignments;

        await transactionalEntityManager.save(timeBlock);

        // Actualizar la asignación
        if (updateDto.cashierId) assignment.cashierId = updateDto.cashierId;
        if (updateDto.startTime) assignment.actualStartTime = updateDto.startTime;
        if (updateDto.endTime) assignment.actualEndTime = updateDto.endTime;

        const updatedAssignment = await transactionalEntityManager.save(assignment);

        // Invalidar caché
        await this.cacheManager.del(`${this.CACHE_PREFIX}_${id}`);
        await this.cacheManager.del(`${this.CACHE_PREFIX}_list`);

        return updatedAssignment;
      });
    } catch (error) {
      this.metrics.assignmentErrors.inc();
      this.logger.error(`Error updating assignment: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to update assignment: ${error.message}`);
    } finally {
      timer();
    }
  }

  /**
   * Elimina una asignación
   */
  async remove(id: string): Promise<void> {
    try {
      const assignment = await this.findOne(id);
      await this.assignmentRepository.remove(assignment);
      await this.cacheManager.del(`${this.CACHE_PREFIX}_${id}`);
    } catch (error) {
      this.logger.error(`Error removing assignment: ${error.message}`, error.stack);
      throw error;
    }
  }

  private validateCreateAssignmentDto(dto: CreateAssignmentDto): void {
    if (!dto.cashierId) {
      throw new BadRequestException('cashierId is required');
    }
    if (!dto.storeScheduleId) {
      throw new BadRequestException('storeScheduleId is required');
    }
    if (!dto.startTime || !dto.endTime) {
      throw new BadRequestException('startTime and endTime are required');
    }
  }

  private validateRequestShiftSwapDto(dto: RequestShiftSwapDto): void {
    if (!dto.assignmentId) {
      throw new BadRequestException('assignmentId is required');
    }
    if (!dto.requestedCashierId) {
      throw new BadRequestException('requestedCashierId is required');
    }
  }

  private async getOrCreateTimeBlockTemplate(dto: CreateAssignmentDto): Promise<TimeBlockTemplate> {
    if (dto.templateId) {
      const template = await this.timeBlockTemplateService.getTemplateById(dto.templateId);
      if (!template) {
        throw new NotFoundException(`Time block template with id ${dto.templateId} not found`);
      }
      return template;
    }

    const startTimeOffset = this.calculateTimeOffset(dto.startTime);
    const endTimeOffset = this.calculateTimeOffset(dto.endTime);

    return this.timeBlockTemplateService.createTemplate({
      name: `Template for ${dto.cashierId}`,
      startTimeOffset,
      endTimeOffset,
      maxAssignments: dto.maxAssignments || 1,
      storeId: dto.storeId,
      isActive: true,
    });
  }

  private async createTimeBlock(
    dto: CreateAssignmentDto,
    template: TimeBlockTemplate,
  ): Promise<TimeBlock> {
    const storeSchedule = await this.entityManager.findOne(StoreSchedule, {
      where: { id: dto.storeScheduleId },
    });

    if (!storeSchedule) {
      throw new NotFoundException(`Store schedule with id ${dto.storeScheduleId} not found`);
    }

    return this.timeBlockService.create({
      startTime: dto.startTime,
      endTime: dto.endTime,
      isAvailable: true,
      maxAssignments: dto.maxAssignments || 1,
      storeScheduleId: dto.storeScheduleId,
      templateId: template.id,
    });
  }

  /**
   * Calcula el offset de tiempo con memoización
   */
  private calculateTimeOffset(date: Date): number {
    const key = date.toISOString();
    if (this.timeOffsetCache.has(key)) {
      return this.timeOffsetCache.get(key);
    }
    
    const offset = date.getHours() * 60 + date.getMinutes();
    this.timeOffsetCache.set(key, offset);
    return offset;
  }
}