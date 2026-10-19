import { validate } from 'class-validator';
import { IsPermissionName } from './is-permission-name.validator';

class PermissionDto {
  @IsPermissionName()
  name: string;
}

describe('IsPermissionName', () => {
  it('accepts lowercase letters, digits, underscores', async () => {
    const dto = new PermissionDto();
    dto.name = 'store_read';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects empty string', async () => {
    const dto = new PermissionDto();
    dto.name = '';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects uppercase', async () => {
    const dto = new PermissionDto();
    dto.name = 'Store_read';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects spaces and hyphens', async () => {
    for (const name of ['store read', 'store-read']) {
      const dto = new PermissionDto();
      dto.name = name;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    }
  });
});
