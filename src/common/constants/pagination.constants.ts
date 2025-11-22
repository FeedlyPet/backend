export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  SORT_ORDER: {
    ASC: 'ASC' as const,
    DESC: 'DESC' as const,
  },
  DEFAULT_SORT_ORDER: 'DESC' as const,
} as const;

export const COMMON_SORT_FIELDS = {
  TIMESTAMP: 'timestamp',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  NAME: 'name',
} as const;