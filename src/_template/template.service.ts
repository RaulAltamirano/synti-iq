import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateItem } from './entities/template-item.entity';
import { CreateTemplateItemDto } from './dto/create-template-item.dto';
import { UpdateTemplateItemDto } from './dto/update-template-item.dto';
import { FilterTemplateItemDto } from './dto/filter-template-item.dto';
import { TemplateItemResponseDto } from './dto/template-item-response.dto';
import { TemplateItemPaginatedDto } from './dto/template-item-paginated.dto';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { TemplateMetricsService } from './services/template-metrics.service';
import { TEMPLATE_SPAN_NAMES, TEMPLATE_SPAN_ATTRIBUTES } from './constants';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    @InjectRepository(TemplateItem)
    private readonly templateItemRepository: Repository<TemplateItem>,
    private readonly observabilityService: ObservabilityService,
    private readonly templateMetrics: TemplateMetricsService,
  ) {}

  async findAll(filter: FilterTemplateItemDto): Promise<TemplateItemPaginatedDto> {
    return this.observabilityService.withSpan(TEMPLATE_SPAN_NAMES.LIST, async span => {
      const result = await this.fetchAllPaginated(filter);
      span.setAttribute(TEMPLATE_SPAN_ATTRIBUTES.PAGE, result.page);
      span.setAttribute(TEMPLATE_SPAN_ATTRIBUTES.LIMIT, result.limit);
      span.setAttribute(TEMPLATE_SPAN_ATTRIBUTES.TOTAL_ITEMS, result.total);
      return result;
    });
  }

  private async fetchAllPaginated(
    filter: FilterTemplateItemDto,
  ): Promise<TemplateItemPaginatedDto> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const sortBy = filter.sortBy ?? 'createdAt';
    const sortOrder = filter.sortOrder ?? 'DESC';
    const skip = (page - 1) * limit;

    const qb = this.templateItemRepository.createQueryBuilder('item');

    if (filter.name) {
      qb.andWhere('item.name ILIKE :name', { name: `%${filter.name}%` });
    }
    if (filter.status) {
      qb.andWhere('item.status = :status', { status: filter.status });
    }

    qb.orderBy(`item.${sortBy}`, sortOrder).skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    const totalPages = Math.ceil(total / limit) || 1;

    this.templateMetrics.recordList(items.length, filter.status);

    return {
      items: items.map(this.toResponseDto),
      total,
      page,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async findById(id: string): Promise<TemplateItemResponseDto | null> {
    return this.observabilityService.withSpan(TEMPLATE_SPAN_NAMES.FIND_BY_ID, async span => {
      span.setAttribute(TEMPLATE_SPAN_ATTRIBUTES.ITEM_ID, id);
      const item = await this.templateItemRepository.findOne({ where: { id } });
      return item ? this.toResponseDto(item) : null;
    });
  }

  async create(dto: CreateTemplateItemDto): Promise<TemplateItemResponseDto> {
    return this.observabilityService.withSpan(TEMPLATE_SPAN_NAMES.CREATE, async span => {
      span.setAttribute(TEMPLATE_SPAN_ATTRIBUTES.STATUS, dto.status ?? 'active');

      const item = this.templateItemRepository.create({
        name: dto.name,
        status: dto.status ?? 'active',
      });
      const saved = await this.templateItemRepository.save(item);

      this.templateMetrics.recordCreate();
      this.logger.log('Template item created', TemplateService.name);

      return this.toResponseDto(saved);
    });
  }

  async update(id: string, dto: UpdateTemplateItemDto): Promise<TemplateItemResponseDto> {
    return this.observabilityService.withSpan(TEMPLATE_SPAN_NAMES.UPDATE, async span => {
      span.setAttribute(TEMPLATE_SPAN_ATTRIBUTES.ITEM_ID, id);

      const item = await this.templateItemRepository.findOne({ where: { id } });
      if (!item) {
        this.logger.warn('Template item not found for update', TemplateService.name);
        throw new NotFoundException('Template item not found');
      }

      if (dto.name !== undefined) item.name = dto.name;
      if (dto.status !== undefined) item.status = dto.status;

      const saved = await this.templateItemRepository.save(item);
      this.logger.log('Template item updated', TemplateService.name);

      return this.toResponseDto(saved);
    });
  }

  async delete(id: string): Promise<void> {
    return this.observabilityService.withSpan(TEMPLATE_SPAN_NAMES.DELETE, async span => {
      span.setAttribute(TEMPLATE_SPAN_ATTRIBUTES.ITEM_ID, id);

      const result = await this.templateItemRepository.delete({ id });
      if (result.affected === 0) {
        this.logger.warn('Template item not found for delete', TemplateService.name);
        throw new NotFoundException('Template item not found');
      }
      this.logger.log('Template item deleted', TemplateService.name);
    });
  }

  private toResponseDto(item: TemplateItem): TemplateItemResponseDto {
    return {
      id: item.id,
      name: item.name,
      status: item.status,
      createdAt: item.createdAt,
    };
  }
}
