import { createHash } from 'crypto';
import { PaginatedResponse } from '../interfaces/PaginatedResponse';
import { BasePaginationParams } from '../dtos/base-pagination-params';

export class PaginationCacheUtil {
  // Método estático para generar clave de caché
  static buildCacheKey(prefix: string, filters: Record<string, any>): string {
    // Ordenar claves para consistencia
    const orderedFilters = Object.keys(filters)
      .sort()
      .reduce((obj, key) => {
        // Evitar incluir valores undefined o null
        if (filters[key] !== undefined && filters[key] !== null) {
          obj[key] = filters[key];
        }
        return obj;
      }, {});

    // Generar hash usando SHA-256
    return `${prefix}:${createHash('sha256')
      .update(JSON.stringify(orderedFilters))
      .digest('hex')}`;
  }

  // Método para crear respuesta paginada
  static createPaginatedResponse<T>({
    data,
    total,
    page,
    limit,
  }: {
    data: T[];
    total: number;
    page: number;
    limit: number;
  }): PaginatedResponse<T> {
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  // Método para aplicar paginación a una consulta
  static applyPagination<T>(
    queryBuilder: any,
    paginationParams: BasePaginationParams,
  ) {
    const { page, limit, sortBy, sortOrder } = paginationParams;

    // Aplicar ordenamiento
    if (sortBy) {
      queryBuilder.orderBy(`${queryBuilder.alias}.${sortBy}`, sortOrder);
    }

    // Aplicar paginación
    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder;
  }
}
