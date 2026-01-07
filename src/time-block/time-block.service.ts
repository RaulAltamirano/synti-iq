import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, LessThan, MoreThan } from 'typeorm';
import { TimeBlock } from './entities/time-block.entity';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';
import { TimeBlockTemplateService } from 'src/time-block-template/time-block-template.service';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';

@Injectable()
export class TimeBlockService {
  private readonly logger = new Logger(TimeBlockService.name);

  constructor(
    @InjectRepository(TimeBlock)
    private readonly timeBlockRepository: Repository<TimeBlock>,
    @InjectRepository(TimeBlockTemplate)
    private templateRepository: Repository<TimeBlockTemplate>,
    private timeBlockTemplateService: TimeBlockTemplateService,
    private entityManager: EntityManager,
  ) {}

  async create(data: Partial<TimeBlock>): Promise<TimeBlock> {
    const timeBlock = this.timeBlockRepository.create(data);
    return this.timeBlockRepository.save(timeBlock);
  }

  async createFromTemplate(
    templateId: string,
    startDate: Date,
    endDate: Date,
    storeScheduleId: string,
  ): Promise<TimeBlock[]> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Plantilla no encontrada');
    }

    return await this.timeBlockTemplateService.generateTimeBlocksFromTemplate(
      template,
      startDate,
      endDate,
      storeScheduleId,
    );
  }

  async update(id: string, data: Partial<TimeBlock>): Promise<TimeBlock> {
    await this.findOne(id);
    await this.timeBlockRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const timeBlock = await this.findOne(id);
    await this.timeBlockRepository.remove(timeBlock);
  }

  async findOne(id: string): Promise<TimeBlock> {
    const timeBlock = await this.timeBlockRepository.findOne({
      where: { id },
      relations: ['storeSchedule'],
    });

    if (!timeBlock) {
      throw new NotFoundException(`TimeBlock with ID ${id} not found`);
    }

    return timeBlock;
  }

  async findByStoreSchedule(
    storeScheduleId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimeBlock[]> {
    const query = this.timeBlockRepository
      .createQueryBuilder('timeBlock')
      .where('timeBlock.storeScheduleId = :storeScheduleId', {
        storeScheduleId,
      })
      .leftJoinAndSelect('timeBlock.template', 'template')
      .leftJoinAndSelect('timeBlock.storeSchedule', 'storeSchedule');

    if (startDate) {
      query.andWhere('timeBlock.startTime >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('timeBlock.endTime <= :endDate', { endDate });
    }

    return await query.getMany();
  }

  async findByTemplate(templateId: string, startDate?: Date, endDate?: Date): Promise<TimeBlock[]> {
    const query = this.timeBlockRepository
      .createQueryBuilder('timeBlock')
      .where('timeBlock.templateId = :templateId', { templateId })
      .leftJoinAndSelect('timeBlock.template', 'template')
      .leftJoinAndSelect('timeBlock.storeSchedule', 'storeSchedule');

    if (startDate) {
      query.andWhere('timeBlock.startTime >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('timeBlock.endTime <= :endDate', { endDate });
    }

    return await query.getMany();
  }

  async findOverlappingAssignments(
    startTime: Date,
    endTime: Date,
    storeScheduleId: string,
  ): Promise<number> {
    return this.timeBlockRepository.count({
      where: {
        storeScheduleId,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });
  }
}
