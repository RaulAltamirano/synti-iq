import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTemplateItemDto } from '../../dto/create-template-item.dto';

describe('CreateTemplateItemDto', () => {
  describe('validation', () => {
    it('should pass when name is non-empty and status is optional', async () => {
      const dto = plainToInstance(CreateTemplateItemDto, {
        name: 'Test Item',
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
    });

    it('should pass when name and status are valid', async () => {
      const dto = plainToInstance(CreateTemplateItemDto, {
        name: 'My Item',
        status: 'active',
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
    });

    it('should pass when status is inactive', async () => {
      const dto = plainToInstance(CreateTemplateItemDto, {
        name: 'My Item',
        status: 'inactive',
      });
      const errors = await validate(dto, { whitelist: true });
      expect(errors).toHaveLength(0);
    });

    it('should fail when name is empty', async () => {
      const dto = plainToInstance(CreateTemplateItemDto, {
        name: '',
      });
      const errors = await validate(dto, { whitelist: true });
      const nameError = errors.find(e => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should fail when name is missing', async () => {
      const dto = plainToInstance(CreateTemplateItemDto, {});
      const errors = await validate(dto, { whitelist: true });
      const nameError = errors.find(e => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should fail when status is invalid', async () => {
      const dto = plainToInstance(CreateTemplateItemDto, {
        name: 'Valid Name',
        status: 'invalid',
      });
      const errors = await validate(dto, { whitelist: true });
      const statusError = errors.find(e => e.property === 'status');
      expect(statusError).toBeDefined();
    });
  });
});
