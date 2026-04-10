import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, Logger } from '@nestjs/common';
import { TemplateService } from '../template.service';
import { TemplateItem } from '../entities/template-item.entity';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { TemplateMetricsService } from '../services/template-metrics.service';
import {
  SPAN_TEMPLATE_LIST,
  SPAN_TEMPLATE_FIND_BY_ID,
  SPAN_TEMPLATE_CREATE,
  SPAN_TEMPLATE_UPDATE,
  SPAN_TEMPLATE_DELETE,
} from '../constants';
import { createMockObservabilityService, createMockTemplateMetricsService } from './mocks';
import { createTemplateItemFixture } from './fixtures';

const mockObservabilityService = createMockObservabilityService();
const mockTemplateMetricsService = createMockTemplateMetricsService();

type TemplateItemRepositoryMock = {
  createQueryBuilder: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
};

function registerFindAllTests(
  getService: () => TemplateService,
  getRepo: () => TemplateItemRepositoryMock,
): void {
  describe('findAll', () => {
    it('returns paginated items with correct structure', async () => {
      const service = getService();
      const repo = getRepo();
      const items = [
        createTemplateItemFixture({ id: '1', name: 'Item 1' }),
        createTemplateItemFixture({ id: '2', name: 'Item 2' }),
      ];
      const qb = repo.createQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([items, 2]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
    });

    it('calls withSpan with SPAN_TEMPLATE_LIST', async () => {
      const service = getService();
      const repo = getRepo();
      const qb = repo.createQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10 });

      expect(mockObservabilityService.withSpan).toHaveBeenCalledWith(
        SPAN_TEMPLATE_LIST,
        expect.any(Function),
      );
    });

    it('calls templateMetrics.recordList with item count', async () => {
      const service = getService();
      const repo = getRepo();
      const items = [createTemplateItemFixture()];
      const qb = repo.createQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([items, 1]);

      await service.findAll({ page: 1, limit: 10 });

      expect(mockTemplateMetricsService.recordList).toHaveBeenCalledWith(1, undefined);
    });
  });
}

function registerFindByIdTests(
  getService: () => TemplateService,
  getRepo: () => TemplateItemRepositoryMock,
): void {
  describe('findById', () => {
    it('throws NotFoundException when item not found', async () => {
      const service = getService();
      const repo = getRepo();
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent-id')).rejects.toThrow('Template item not found');
    });

    it('returns TemplateItemResponseDto when item exists', async () => {
      const service = getService();
      const repo = getRepo();
      const item = createTemplateItemFixture({ id: 'item-1', name: 'Found Item' });
      repo.findOne.mockResolvedValue(item);

      const result = await service.findById('item-1');

      expect(result).toEqual({
        id: 'item-1',
        name: 'Found Item',
        status: 'active',
        createdAt: item.createdAt,
      });
    });

    it('calls withSpan with SPAN_TEMPLATE_FIND_BY_ID', async () => {
      const service = getService();
      const repo = getRepo();
      const item = createTemplateItemFixture({ id: 'some-id' });
      repo.findOne.mockResolvedValue(item);

      await service.findById('some-id');

      expect(mockObservabilityService.withSpan).toHaveBeenCalledWith(
        SPAN_TEMPLATE_FIND_BY_ID,
        expect.any(Function),
      );
    });
  });
}

function registerCreateTests(
  getService: () => TemplateService,
  getRepo: () => TemplateItemRepositoryMock,
): void {
  describe('create', () => {
    it('persists and returns TemplateItemResponseDto', async () => {
      const service = getService();
      const repo = getRepo();
      const dto = { name: 'New Item', status: 'active' as const };
      const saved = createTemplateItemFixture({ id: 'new-id', name: 'New Item' });
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(result.id).toBe('new-id');
      expect(result.name).toBe('New Item');
      expect(result.status).toBe('active');
      expect(repo.create).toHaveBeenCalledWith({
        name: 'New Item',
        status: 'active',
      });
      expect(repo.save).toHaveBeenCalled();
      expect(mockTemplateMetricsService.recordCreate).toHaveBeenCalled();
    });

    it('calls withSpan with SPAN_TEMPLATE_CREATE', async () => {
      const service = getService();
      const repo = getRepo();
      const dto = { name: 'New Item' };
      const saved = createTemplateItemFixture({ id: 'new-id', name: 'New Item' });
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      await service.create(dto);

      expect(mockObservabilityService.withSpan).toHaveBeenCalledWith(
        SPAN_TEMPLATE_CREATE,
        expect.any(Function),
      );
    });
  });
}

function registerUpdateTests(
  getService: () => TemplateService,
  getRepo: () => TemplateItemRepositoryMock,
): void {
  describe('update', () => {
    it('throws NotFoundException when item not found', async () => {
      const service = getService();
      const repo = getRepo();
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        'Template item not found',
      );
    });

    it('updates and returns TemplateItemResponseDto when item exists', async () => {
      const service = getService();
      const repo = getRepo();
      const existing = createTemplateItemFixture({ id: 'item-1', name: 'Old Name' });
      const updated = { ...existing, name: 'New Name' };
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('item-1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(repo.save).toHaveBeenCalled();
      expect(mockTemplateMetricsService.recordUpdate).toHaveBeenCalled();
    });

    it('calls withSpan with SPAN_TEMPLATE_UPDATE', async () => {
      const service = getService();
      const repo = getRepo();
      const existing = createTemplateItemFixture({ id: 'item-1', name: 'Old' });
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockResolvedValue({ ...existing, name: 'New' });

      await service.update('item-1', { name: 'New' });

      expect(mockObservabilityService.withSpan).toHaveBeenCalledWith(
        SPAN_TEMPLATE_UPDATE,
        expect.any(Function),
      );
    });
  });
}

function registerDeleteTests(
  getService: () => TemplateService,
  getRepo: () => TemplateItemRepositoryMock,
): void {
  describe('delete', () => {
    it('throws NotFoundException when item not found', async () => {
      const service = getService();
      const repo = getRepo();
      repo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent')).rejects.toThrow('Template item not found');
    });

    it('deletes when item exists', async () => {
      const service = getService();
      const repo = getRepo();
      repo.delete.mockResolvedValue({ affected: 1 });

      await service.delete('item-1');

      expect(repo.delete).toHaveBeenCalledWith({ id: 'item-1' });
      expect(mockTemplateMetricsService.recordDelete).toHaveBeenCalled();
    });

    it('calls withSpan with SPAN_TEMPLATE_DELETE', async () => {
      const service = getService();
      const repo = getRepo();
      repo.delete.mockResolvedValue({ affected: 1 });

      await service.delete('item-1');

      expect(mockObservabilityService.withSpan).toHaveBeenCalledWith(
        SPAN_TEMPLATE_DELETE,
        expect.any(Function),
      );
    });
  });
}

describe('TemplateService', () => {
  let service: TemplateService;
  let templateItemRepository: TemplateItemRepositoryMock;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();

    const mockGetManyAndCount = jest.fn().mockResolvedValue([[], 0]);
    const mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: mockGetManyAndCount,
    };

    templateItemRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        { provide: getRepositoryToken(TemplateItem), useValue: templateItemRepository },
        { provide: ObservabilityService, useValue: mockObservabilityService },
        { provide: TemplateMetricsService, useValue: mockTemplateMetricsService },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const getService = () => service;
  const getRepo = () => templateItemRepository;
  registerFindAllTests(getService, getRepo);
  registerFindByIdTests(getService, getRepo);
  registerCreateTests(getService, getRepo);
  registerUpdateTests(getService, getRepo);
  registerDeleteTests(getService, getRepo);
});
