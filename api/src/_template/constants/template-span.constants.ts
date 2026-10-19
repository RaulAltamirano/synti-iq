/**
 * Template domain OpenTelemetry semantic convention constants.
 * Aligned with OpenTelemetry naming: ATTR_ for attributes, SPAN_ for span names.
 * @see https://opentelemetry.io/docs/specs/semconv/
 */

/** Span/operation names for template tracing */
export const SPAN_TEMPLATE_LIST = 'template.list' as const;
export const SPAN_TEMPLATE_FIND_BY_ID = 'template.findById' as const;
export const SPAN_TEMPLATE_CREATE = 'template.create' as const;
export const SPAN_TEMPLATE_UPDATE = 'template.update' as const;
export const SPAN_TEMPLATE_DELETE = 'template.delete' as const;

/** Attribute keys for template span attributes */
export const ATTR_TEMPLATE_ITEM_ID = 'template.template_item_id' as const;
export const ATTR_TEMPLATE_PAGE = 'template.page' as const;
export const ATTR_TEMPLATE_LIMIT = 'template.limit' as const;
export const ATTR_TEMPLATE_TOTAL_ITEMS = 'template.total_items' as const;
export const ATTR_TEMPLATE_STATUS = 'template.status' as const;

/** Union type of all attribute keys for strict typing */
export type TemplateSpanAttributeKey =
  | typeof ATTR_TEMPLATE_ITEM_ID
  | typeof ATTR_TEMPLATE_PAGE
  | typeof ATTR_TEMPLATE_LIMIT
  | typeof ATTR_TEMPLATE_TOTAL_ITEMS
  | typeof ATTR_TEMPLATE_STATUS;

/**
 * Grouped span names for concise imports in services.
 * Usage: import { TEMPLATE_SPAN_NAMES } from './constants'
 */
export const TEMPLATE_SPAN_NAMES = {
  LIST: SPAN_TEMPLATE_LIST,
  FIND_BY_ID: SPAN_TEMPLATE_FIND_BY_ID,
  CREATE: SPAN_TEMPLATE_CREATE,
  UPDATE: SPAN_TEMPLATE_UPDATE,
  DELETE: SPAN_TEMPLATE_DELETE,
} as const;

/**
 * Grouped attribute keys for concise imports in services.
 * Usage: import { TEMPLATE_SPAN_ATTRIBUTES } from './constants'
 */
export const TEMPLATE_SPAN_ATTRIBUTES = {
  ITEM_ID: ATTR_TEMPLATE_ITEM_ID,
  PAGE: ATTR_TEMPLATE_PAGE,
  LIMIT: ATTR_TEMPLATE_LIMIT,
  TOTAL_ITEMS: ATTR_TEMPLATE_TOTAL_ITEMS,
  STATUS: ATTR_TEMPLATE_STATUS,
} as const;
