import { createHash } from 'crypto';
import { Logger } from '@nestjs/common';
import type { SelectQueryBuilder } from 'typeorm';
import type { PaginatedResponse } from '../interfaces/PaginatedResponse';
import type { BasePaginationParams } from '../dtos/base-pagination-params';
import type { CacheService } from 'src/cache/cache.service';

export class PaginationCacheUtil {
  static buildCacheKey(prefix: string, filters: Record<string, any>): string {
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

  private static sanitizeFilters(filters: Record<string, any>, depth = 0): Record<string, any> {
    if (depth > 3) return {};

    return Object.keys(filters)
      .sort()
      .reduce((obj, key) => {
        const value = filters[key];
        if (value === undefined || value === null) return obj;

        if (typeof value === 'object' && !Array.isArray(value)) {
          obj[key] = this.sanitizeFilters(value, depth + 1);
        } else {
          obj[key] = value;
        }

        return obj;
      }, {});
  }

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

  static applyPagination<T>(
    queryBuilder: any,
    paginationParams: BasePaginationParams,
    options?: {
      aliasOverride?: string;
      columnMap?: Record<string, string>;
      metricsCollector?: (metrics: any) => void;
    },
  ) {
    const startTime = options?.metricsCollector ? Date.now() : 0;

    const { page = 1, limit = 10, sortBy, sortOrder = 'ASC' } = paginationParams;

    const validPage = Math.max(1, Number(page) || 1);
    const validLimit = Math.min(Math.max(1, Number(limit) || 10), 100); // Prevenir límites extremos

    const alias = options?.aliasOverride || queryBuilder.alias || '';

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

  static async getPaginatedResults<T>(
    cacheService: CacheService,
    cachePrefix: string,
    paginationParams: BasePaginationParams,
    fetchDataFn: () => Promise<{ items: T[]; total: number }>,
    options: {
      ttl?: number;
      staleWhileRevalidate?: boolean;
      metricsCollector?: (metrics: any) => void;
    } = {},
  ): Promise<PaginatedResponse<T>> {
    const cacheKey = this.buildCacheKey(cachePrefix, paginationParams);

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
