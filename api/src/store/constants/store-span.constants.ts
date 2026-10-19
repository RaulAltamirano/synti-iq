/** OpenTelemetry span names for store operations */
export const SPAN_STORE_FIND_ALL = 'store.findAll' as const;
export const SPAN_STORE_FIND_ONE = 'store.findOne' as const;
export const SPAN_STORE_FIND_STORE_CASHIERS = 'store.findStoreCashiers' as const;

export const STORE_SPAN_NAMES = {
  FIND_ALL: SPAN_STORE_FIND_ALL,
  FIND_ONE: SPAN_STORE_FIND_ONE,
  FIND_STORE_CASHIERS: SPAN_STORE_FIND_STORE_CASHIERS,
} as const;

/** Span attribute keys */
export const ATTR_STORE_PAGE = 'store.page' as const;
export const ATTR_STORE_LIMIT = 'store.limit' as const;
export const ATTR_STORE_TOTAL = 'store.total' as const;
export const ATTR_STORE_ID = 'store.store_id' as const;

export const STORE_SPAN_ATTRIBUTES = {
  PAGE: ATTR_STORE_PAGE,
  LIMIT: ATTR_STORE_LIMIT,
  TOTAL: ATTR_STORE_TOTAL,
  STORE_ID: ATTR_STORE_ID,
} as const;
