import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginatedResponseDto } from '../dto/pagination.dto';
import { PAGINATION_DEFAULTS } from '../constants';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class PaginationHelper {
  static applyPagination<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    query: PaginationQuery,
    alias: string,
    defaultSortBy: string = 'createdAt',
  ): SelectQueryBuilder<T> {
    const {
      page = PAGINATION_DEFAULTS.PAGE,
      limit = PAGINATION_DEFAULTS.LIMIT,
      sortBy = defaultSortBy,
      sortOrder = PAGINATION_DEFAULTS.DEFAULT_SORT_ORDER,
    } = query;

    const skip = (page - 1) * limit;

    return queryBuilder
      .orderBy(`${alias}.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);
  }

  static async buildPaginatedResponse<T extends ObjectLiteral, R>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number,
    limit: number,
    mapFunction: (item: T) => R,
  ): Promise<PaginatedResponseDto<R>> {
    const [items, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: items.map(mapFunction),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  static applyDateRangeFilter<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    alias: string,
    field: string,
    startDate?: string,
    endDate?: string,
  ): SelectQueryBuilder<T> {
    if (startDate && endDate) {
      queryBuilder.andWhere(`${alias}.${field} BETWEEN :startDate AND :endDate`, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere(`${alias}.${field} >= :startDate`, {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere(`${alias}.${field} <= :endDate`, {
        endDate: new Date(endDate),
      });
    }

    return queryBuilder;
  }
}