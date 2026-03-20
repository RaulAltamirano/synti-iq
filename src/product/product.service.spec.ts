import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { CacheService } from 'src/cache/cache.service';

const createProductFixture = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 'product-id-1',
    name: 'Test Product',
    sku: 'SKU-001',
    barcode: '123456789012',
    purchasePrice: 50,
    sellingPrice: 100,
    profitMargin: 50,
    isActive: true,
    ...overrides,
  }) as Product;

const createMockQueryBuilder = (overrides: { getMany?: jest.Mock; getCount?: jest.Mock } = {}) => {
  const getMany = overrides.getMany ?? jest.fn().mockResolvedValue([]);
  const getCount = overrides.getCount ?? jest.fn().mockResolvedValue(0);
  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    useIndex: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany,
    getCount,
    clone: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
  };
  qb.clone.mockReturnValue(qb);
  return qb;
};

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let cacheService: { get: jest.Mock };
  let inventoryRepository: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    jest.spyOn(require('@nestjs/common').Logger.prototype, 'error').mockImplementation();

    productRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(createMockQueryBuilder()),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    cacheService = {
      get: jest.fn((_key: string, fetchFn: () => Promise<unknown>) => fetchFn()),
    };

    inventoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: productRepository },
        { provide: getRepositoryToken(Inventory), useValue: inventoryRepository },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns paginated products with correct structure', async () => {
      const products = [
        createProductFixture({ id: '1', name: 'Product 1' }),
        createProductFixture({ id: '2', name: 'Product 2' }),
      ];
      const mockQb = createMockQueryBuilder({
        getMany: jest.fn().mockResolvedValue(products),
        getCount: jest.fn().mockResolvedValue(2),
      });
      productRepository.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(cacheService.get).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when product not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent-id')).rejects.toThrow(
        'Product with ID non-existent-id not found',
      );
    });

    it('returns product when found', async () => {
      const product = createProductFixture({ id: 'found-id', name: 'Found Product' });
      productRepository.findOne.mockResolvedValue(product);

      const result = await service.findById('found-id');

      expect(result).toEqual(product);
      expect(result.id).toBe('found-id');
      expect(result.name).toBe('Found Product');
    });
  });

  describe('update', () => {
    it('throws NotFoundException when product not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when SKU already exists', async () => {
      const existing = createProductFixture({ id: 'my-id', sku: 'MY-SKU' });
      const duplicate = createProductFixture({ id: 'other-id', sku: 'DUPE-SKU' });
      productRepository.findOne.mockResolvedValue(existing);

      const mockQb = createMockQueryBuilder({
        getMany: jest.fn().mockResolvedValue([duplicate]),
      });
      productRepository.createQueryBuilder.mockReturnValue(mockQb);

      await expect(service.update('my-id', { sku: 'DUPE-SKU' })).rejects.toThrow(ConflictException);
      await expect(service.update('my-id', { sku: 'DUPE-SKU' })).rejects.toThrow(
        /A product with SKU DUPE-SKU already exists/,
      );
    });

    it('updates and returns product when no duplicates', async () => {
      const existing = createProductFixture({ id: 'my-id', name: 'Old Name' });
      const updated = { ...existing, name: 'New Name' };
      productRepository.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);

      const mockQb = createMockQueryBuilder({ getMany: jest.fn().mockResolvedValue([]) });
      productRepository.createQueryBuilder.mockReturnValue(mockQb);
      productRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update('my-id', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(productRepository.update).toHaveBeenCalledWith(
        'my-id',
        expect.objectContaining({ name: 'New Name' }),
      );
    });
  });
});
