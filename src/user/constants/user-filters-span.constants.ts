/** OpenTelemetry span names for user filter operations */
export const SPAN_USER_FILTERS_FILTER_BY_BUSINESS = 'user.filters.filterUsersByBusiness' as const;
export const SPAN_USER_FILTERS_FILTER_USERS = 'user.filters.filterUsers' as const;

export const USER_FILTERS_SPAN_NAMES = {
  FILTER_BY_BUSINESS: SPAN_USER_FILTERS_FILTER_BY_BUSINESS,
  FILTER_USERS: SPAN_USER_FILTERS_FILTER_USERS,
} as const;

export const ATTR_USER_FILTERS_TOTAL = 'user.filters.total' as const;
export const ATTR_USER_FILTERS_PAGE = 'user.filters.page' as const;

export const USER_FILTERS_SPAN_ATTRIBUTES = {
  TOTAL: ATTR_USER_FILTERS_TOTAL,
  PAGE: ATTR_USER_FILTERS_PAGE,
} as const;
