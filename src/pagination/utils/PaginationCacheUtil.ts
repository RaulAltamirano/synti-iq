import { createHash } from 'crypto';
<<<<<<< feat/harden-pagination-cache-util
import { SelectQueryBuilder } from 'typeorm';
import { PaginatedResponse } from '../interfaces/PaginatedResponse';
import { BasePaginationParams } from '../dtos/base-pagination-params';
import { CacheService } from 'src/cache/cache.service';
=======
import { Logger } from '@nestjs/common';
import type { SelectQueryBuilder } from 'typeorm';
import type { PaginatedResponse } from '../interfaces/PaginatedResponse';
import type { BasePaginationParams } from '../dtos/base-pagination-params';
import type { CacheService } from 'src/cache/cache.service';
>>>>>>> dev

/**
 * Interfaz para métricas de paginación
 */
interface PaginationMetrics {
  page?: number;
  limit?: number;
  executionTime: number;
  filters?: BasePaginationParams;
  cacheKey?: string;
  params?: BasePaginationParams;
  cached?: boolean;
  error?: boolean;
}

export class PaginationCacheUtil {
  /**
   * Construye una clave de caché determinística a partir de un prefijo y filtros
   * @param prefix - Prefijo para la clave de caché (ej: 'stores', 'products')
   * @param filters - Objeto con filtros para serializar
   * @returns Clave de caché única para los filtros proporcionados
   */
  static buildCacheKey(prefix: string, filters: Record<string, unknown>): string {
    if (!prefix) {
      throw new Error('Cache prefix is required');
    }

    if (!filters || typeof filters !== 'object') {
      throw new Error('Filters must be a valid object');
    }

    const sanitizedFilters = this.sanitizeFilters(filters);

    return `${prefix}:${createHash('sha256')
      .update(JSON.stringify(sanitizedFilters))
      .digest('hex')}`;
  }

  /**
   * Sanitiza filtros eliminando valores null/undefined y limitando profundidad
   * @param filters - Objeto de filtros a sanitizar
   * @param depth - Profundidad actual (evita recursión infinita)
   * @returns Objeto sanitizado sin valores null/undefined
   */
  private static sanitizeFilters(
    filters: Record<string, unknown>,
    depth = 0,
  ): Record<string, unknown> {
    // Limitar profundidad máxima para evitar recursión excesiva
    if (depth > 3) return {};

    const sortedKeys = Object.keys(filters).sort((a, b) => a.localeCompare(b));
    const result: Record<string, unknown> = {};

    for (const key of sortedKeys) {
      const value = filters[key];

      // Saltar valores null o undefined
      if (value === undefined || value === null) continue;

      // Manejar objetos anidados (pero no arrays)
      if (typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.sanitizeFilters(value as Record<string, unknown>, depth + 1);
      }
      // Manejar arrays: sanitizar cada elemento si es objeto
      else if (Array.isArray(value)) {
        result[key] = value.map(item =>
          typeof item === 'object' && item !== null
            ? this.sanitizeFilters(item as Record<string, unknown>, depth + 1)
            : item,
        );
      }
      // Valores primitivos se mantienen igual
      else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Crea una respuesta paginada estandarizada
   */
  static createPaginatedResponse<T>({
    items,
    total,
    page,
    limit,
  }: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  }): PaginatedResponse<T> {
    const safeTotal = Math.max(0, total || 0);
    const safeLimit = Math.max(1, limit || 10);
    const safePage = Math.max(1, page || 1);
    const totalPages = Math.ceil(safeTotal / safeLimit) || 1;

    return {
      items: items || [],
      total: safeTotal,
      page: safePage,
      totalPages,
      limit: safeLimit,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    };
  }

  /**
   * Aplica paginación y ordenamiento a un query builder de TypeORM
   * @param queryBuilder - QueryBuilder de TypeORM
   * @param paginationParams - Parámetros de paginación
   * @param options - Opciones adicionales
   * @returns El mismo queryBuilder con paginación aplicada
   */
  static applyPagination<T>(
    queryBuilder: SelectQueryBuilder<T>,
    paginationParams: BasePaginationParams,
    options?: {
      aliasOverride?: string;
      columnMap?: Record<string, string>;
      metricsCollector?: (metrics: PaginationMetrics) => void;
    },
  ): SelectQueryBuilder<T> {
    const startTime = options?.metricsCollector ? Date.now() : 0;

    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationParams;

    const validPage = Math.max(1, Number(page) || 1);
    const validLimit = Math.min(Math.max(1, Number(limit) || 10), 100);

    const alias = options?.aliasOverride || queryBuilder.alias;

    if (sortBy) {
      const actualColumn = options?.columnMap?.[sortBy] || sortBy;
      const columnRef = alias ? `${alias}.${actualColumn}` : actualColumn;
      queryBuilder.orderBy(columnRef, sortOrder);
    }

    queryBuilder.skip((validPage - 1) * validLimit).take(validLimit);

    if (options?.metricsCollector) {
      options.metricsCollector({
        page: validPage,
        limit: validLimit,
        executionTime: Date.now() - startTime,
        filters: paginationParams,
      });
    }

    return queryBuilder;
  }

  /**
   * Obtiene resultados paginados con caché
   */
  static async getPaginatedResults<T>(
    cacheService: CacheService,
    cachePrefix: string,
    paginationParams: BasePaginationParams,
    fetchDataFn: () => Promise<{ items: T[]; total: number }>,
    options: {
      ttl?: number;
      staleWhileRevalidate?: boolean;
      metricsCollector?: (metrics: PaginationMetrics) => void;
    } = {},
  ): Promise<PaginatedResponse<T>> {
    const cacheKey = this.buildCacheKey(cachePrefix, paginationParams as Record<string, unknown>);

    const startTime = options?.metricsCollector ? Date.now() : 0;

    const fetchFreshData = async (): Promise<PaginatedResponse<T>> => {
      try {
        const { items, total } = await fetchDataFn();

        return this.createPaginatedResponse({
          items,
          total,
          page: Number(paginationParams.page) || 1,
          limit: Number(paginationParams.limit) || 10,
        });
      } catch (error) {
        Logger.error(
          'Error fetching paginated data',
          error instanceof Error ? error.stack : String(error),
          'PaginationCacheUtil',
        );
        throw error;
      }
    };

    try {
      const result = await cacheService.get<PaginatedResponse<T>>(cacheKey, fetchFreshData, {
        ttl: options.ttl,
        staleWhileRevalidate: options.staleWhileRevalidate,
      });

      if (options?.metricsCollector) {
        options.metricsCollector({
          cacheKey,
          executionTime: Date.now() - startTime,
          params: paginationParams,
          cached: true,
        });
      }

      return result;
    } catch (error) {
      Logger.error(
        `Error retrieving paginated data for key ${cacheKey}`,
        error,
        PaginationCacheUtil.name,
      );

      const freshData = await fetchFreshData();

      if (options?.metricsCollector) {
        options.metricsCollector({
          cacheKey,
          executionTime: Date.now() - startTime,
          params: paginationParams,
          cached: false,
          error: true,
        });
      }

      return freshData;
    }
  }

<<<<<<< feat/harden-pagination-cache-util
  /**
   * Invalida todas las claves de caché con un prefijo dado
   */
  static async invalidateCache(cacheService: CacheService, prefix: string): Promise<void> {
=======
  static async paginateQueryBuilder<T>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: BasePaginationParams,
    options: { columnMap: Record<string, string>; aliasOverride?: string },
  ): Promise<PaginatedResponse<T>> {
    const countQueryBuilder = queryBuilder.clone();
    const total = await countQueryBuilder.getCount();
    PaginationCacheUtil.applyPagination(queryBuilder, filters, {
      columnMap: options.columnMap,
      aliasOverride: options.aliasOverride,
    });
    const items = await queryBuilder.getMany();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    return PaginationCacheUtil.createPaginatedResponse({ items, total, page, limit });
  }

  static async invalidateCache(cacheService: any, prefix: string): Promise<void> {
>>>>>>> dev
    try {
      await cacheService.invalidate(`${prefix}:*`);
    } catch (error) {
      Logger.error(
        `Error invalidating cache with prefix ${prefix}`,
        error,
        PaginationCacheUtil.name,
      );
    }
  }
}
