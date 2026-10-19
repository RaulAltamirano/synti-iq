import { IsIn, IsOptional } from 'class-validator';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';

/** Allowed sort fields for cashier listing (TypeORM property names on `CashierProfile`). */
export const STORE_CASHIER_LIST_SORT_FIELDS = [
  'id',
  'cashierNumber',
  'branchOffice',
  'lastActivityAt',
  'isApproved',
] as const;

export type StoreCashierListSortField = (typeof STORE_CASHIER_LIST_SORT_FIELDS)[number];

export class FilterStoreCashiersDto extends BasePaginationParams {
  @IsOptional()
  @IsIn(STORE_CASHIER_LIST_SORT_FIELDS)
  override sortBy?: string = 'cashierNumber';
}
