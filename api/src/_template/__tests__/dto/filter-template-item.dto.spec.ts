import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterTemplateItemDto } from '../../dto/filter-template-item.dto';

describe('FilterTemplateItemDto', () => {
  describe('validation', () => {
    it('should pass when sortBy is allowed value', async () => {
      const dto = plainToInstance(FilterTemplateItemDto, {
        page: 1,
        limit: 10,
        sortBy: 'name',
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
    });

    it('should pass when sortBy is id, name, createdAt, or status', async () => {
      for (const sortBy of ['id', 'name', 'createdAt', 'status']) {
        const dto = plainToInstance(FilterTemplateItemDto, {
          page: 1,
          limit: 10,
          sortBy,
        });
        const errors = await validate(dto, { whitelist: true });
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail when sortBy is invalid', async () => {
      const dto = plainToInstance(FilterTemplateItemDto, {
        page: 1,
        limit: 10,
        sortBy: 'invalidField',
      });
      const errors = await validate(dto, { whitelist: true });
      const sortByError = errors.find(e => e.property === 'sortBy');
      expect(sortByError).toBeDefined();
    });

    it('should pass when status is active or inactive', async () => {
      for (const status of ['active', 'inactive']) {
        const dto = plainToInstance(FilterTemplateItemDto, {
          page: 1,
          limit: 10,
          status,
        });
        const errors = await validate(dto, { whitelist: true });
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail when status is invalid', async () => {
      const dto = plainToInstance(FilterTemplateItemDto, {
        page: 1,
        limit: 10,
        status: 'invalid',
      });
      const errors = await validate(dto, { whitelist: true });
      const statusError = errors.find(e => e.property === 'status');
      expect(statusError).toBeDefined();
    });

    it('should fail when name is empty string', async () => {
      const dto = plainToInstance(FilterTemplateItemDto, {
        page: 1,
        limit: 10,
        name: '',
      });
      const errors = await validate(dto, { whitelist: true });
      const nameError = errors.find(e => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should pass when name is omitted', async () => {
      const dto = plainToInstance(FilterTemplateItemDto, {
        page: 1,
        limit: 10,
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
    });

    it('should pass when name has at least one character', async () => {
      const dto = plainToInstance(FilterTemplateItemDto, {
        page: 1,
        limit: 10,
        name: 'a',
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
    });
  });
});
