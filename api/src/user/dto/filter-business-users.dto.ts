import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { BasePaginationParams } from 'src/pagination/dtos/base-pagination-params';
import { SYSTEM_ROLES } from 'src/shared/enums/roles.enum';

/** Allowed sort fields for business-scoped user listing (TypeORM property names on `User`). */
export const BUSINESS_USER_LIST_SORT_FIELDS = [
  'createdAt',
  'email',
  'firstName',
  'lastName',
  'lastLogin',
  'updatedAt',
] as const;

export type BusinessUserListSortField = (typeof BUSINESS_USER_LIST_SORT_FIELDS)[number];

export class FilterBusinessUsersDto extends BasePaginationParams {
  /** Required for `admin` / `manager`; ignored for `business_owner` / `cashier` (server resolves scope). */
  @IsOptional()
  @IsUUID()
  businessProfileId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsIn(SYSTEM_ROLES, { each: true })
  roles?: string[];

  @IsOptional()
  @IsIn(BUSINESS_USER_LIST_SORT_FIELDS)
  override sortBy?: string = 'createdAt';
}
