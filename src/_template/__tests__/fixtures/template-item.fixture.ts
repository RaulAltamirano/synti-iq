import { TemplateItem } from '../../entities/template-item.entity';

export interface TemplateItemFixtureOverrides {
  id?: string;
  name?: string;
  status?: 'active' | 'inactive';
  createdAt?: Date;
}

/**
 * Fixture base for TemplateItem.
 * Uses spread to allow overrides per test.
 */
export function createTemplateItemFixture(
  overrides: TemplateItemFixtureOverrides = {},
): Partial<TemplateItem> {
  return {
    id: 'template-item-id',
    name: 'Test Item',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
