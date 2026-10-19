import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BasePaginationParams } from './base-pagination-params';

describe('BasePaginationParams', () => {
  describe('validation', () => {
    it('should pass when page and limit are within valid range', async () => {
      const dto = plainToInstance(BasePaginationParams, {
        page: 1,
        limit: 10,
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
    });

    it('should pass when sortOrder is ASC', async () => {
      const dto = plainToInstance(BasePaginationParams, {
        page: 1,
        limit: 10,
        sortOrder: 'ASC',
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
    });

    it('should pass when sortOrder is DESC', async () => {
      const dto = plainToInstance(BasePaginationParams, {
        page: 1,
        limit: 10,
        sortOrder: 'DESC',
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
    });

    it('should fail when sortOrder is invalid', async () => {
      const dto = plainToInstance(BasePaginationParams, {
        page: 1,
        limit: 10,
        sortOrder: 'INVALID',
      });
      const errors = await validate(dto, { whitelist: true });
      const sortOrderError = errors.find(e => e.property === 'sortOrder');
      expect(sortOrderError).toBeDefined();
    });

    it('should fail when limit exceeds 100', async () => {
      const dto = plainToInstance(BasePaginationParams, {
        page: 1,
        limit: 101,
      });
      const errors = await validate(dto, { whitelist: true });
      const limitError = errors.find(e => e.property === 'limit');
      expect(limitError).toBeDefined();
    });

    it('should fail when page is less than 1', async () => {
      const dto = plainToInstance(BasePaginationParams, {
        page: 0,
        limit: 10,
      });
      const errors = await validate(dto, { whitelist: true });
      const pageError = errors.find(e => e.property === 'page');
      expect(pageError).toBeDefined();
    });
  });

  describe('forbidNonWhitelisted', () => {
    it('should strip unknown properties when whitelist is used', async () => {
      const dto = plainToInstance(BasePaginationParams, {
        page: 1,
        limit: 10,
        unknownProp: 'value',
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
      expect(dto).not.toHaveProperty('unknownProp');
    });
  });
});
