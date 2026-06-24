import { PaginationCacheUtil } from './PaginationCacheUtil';
import { CacheService } from '../../cache/cache.service';

// Mock de CacheService
const mockCacheService = {
  get: jest.fn(),
  invalidate: jest.fn(),
} as unknown as CacheService;

describe('PaginationCacheUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildCacheKey', () => {
    it('debe producir la misma key sin importar el orden de las propiedades', () => {
      const prefix = 'test';
      const filters1 = { page: 1, limit: 10, sort: 'name' };
      const filters2 = { sort: 'name', limit: 10, page: 1 };

      const key1 = PaginationCacheUtil.buildCacheKey(prefix, filters1);
      const key2 = PaginationCacheUtil.buildCacheKey(prefix, filters2);

      expect(key1).toBe(key2);
    });

    it('debe ignorar valores null/undefined', () => {
      const prefix = 'test';
      const filtersWithNulls = {
        page: 1,
        search: null,
        category: undefined,
        limit: 10,
      };
      const filtersClean = { page: 1, limit: 10 };

      const key1 = PaginationCacheUtil.buildCacheKey(prefix, filtersWithNulls);
      const key2 = PaginationCacheUtil.buildCacheKey(prefix, filtersClean);

      expect(key1).toBe(key2);
    });

    it('debe manejar objetos anidados consistentemente', () => {
      const prefix = 'test';
      const filters1 = { filter: { name: 'test', active: true } };
      const filters2 = { filter: { active: true, name: 'test' } };

      const key1 = PaginationCacheUtil.buildCacheKey(prefix, filters1);
      const key2 = PaginationCacheUtil.buildCacheKey(prefix, filters2);

      expect(key1).toBe(key2);
    });

    it('debe limitar la profundidad a 3 niveles', () => {
      const prefix = 'test';
      const deepFilters = {
        level1: {
          level2: {
            level3: {
              level4: 'should be ignored',
            },
          },
        },
      };

      expect(() => PaginationCacheUtil.buildCacheKey(prefix, deepFilters)).not.toThrow();
      const key = PaginationCacheUtil.buildCacheKey(prefix, deepFilters);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('debe lanzar error si prefix está vacío', () => {
      expect(() => PaginationCacheUtil.buildCacheKey('', {})).toThrow('Cache prefix is required');
    });

    it('debe lanzar error si filters no es un objeto', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => PaginationCacheUtil.buildCacheKey('test', null as any)).toThrow(
        'Filters must be a valid object',
      );
    });
  });

  describe('sanitizeFilters', () => {
    it('debe eliminar null/undefined', () => {
      const prefix = 'test';
      const input = { a: 1, b: null, c: undefined, d: 'test' };
      const expected = { a: 1, d: 'test' };

      const keyInput = PaginationCacheUtil.buildCacheKey(prefix, input);
      const keyExpected = PaginationCacheUtil.buildCacheKey(prefix, expected);

      expect(keyInput).toBe(keyExpected);
    });

    it('debe sanitizar objetos anidados recursivamente', () => {
      const prefix = 'test';
      const input = {
        user: {
          name: 'john',
          age: null,
          address: {
            city: 'nyc',
            zip: undefined,
          },
        },
      };
      const expected = {
        user: {
          name: 'john',
          address: { city: 'nyc' },
        },
      };

      const keyInput = PaginationCacheUtil.buildCacheKey(prefix, input);
      const keyExpected = PaginationCacheUtil.buildCacheKey(prefix, expected);

      expect(keyInput).toBe(keyExpected);
    });

    it('debe detenerse en profundidad > 3', () => {
      const prefix = 'test';
      const deepFilters = {
        l1: { l2: { l3: { l4: { l5: 'too deep' } } } },
      };

      expect(() => PaginationCacheUtil.buildCacheKey(prefix, deepFilters)).not.toThrow();
    });

    it('debe manejar arrays correctamente', () => {
      const prefix = 'test';
      const input = {
        items: [1, 2, 3],
        users: [{ name: 'john' }, { name: 'jane' }],
      };

      expect(() => PaginationCacheUtil.buildCacheKey(prefix, input)).not.toThrow();
    });
  });

  describe('createPaginatedResponse', () => {
    it('debe crear respuesta paginada correctamente', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = PaginationCacheUtil.createPaginatedResponse({
        data,
        total: 20,
        page: 2,
        limit: 10,
      });

      expect(result).toEqual({
        data,
        total: 20,
        page: 2,
        totalPages: 2,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('debe manejar valores inválidos con defaults', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = PaginationCacheUtil.createPaginatedResponse({
        data: null as any,
        total: -5,
        page: 0,
        limit: 0,
      });

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });

  describe('invalidateCache', () => {
    it('debe llamar a cacheService.invalidate con el prefijo correcto', async () => {
      await PaginationCacheUtil.invalidateCache(mockCacheService, 'products');
      expect(mockCacheService.invalidate).toHaveBeenCalledWith('products:*');
    });
  });
});
