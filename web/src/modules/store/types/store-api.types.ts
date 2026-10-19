/**
 * Shapes aligned with NestJS store module JSON (Swagger / contract).
 * Dates and decimals may arrive as strings from JSON.
 */

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface StoreLocationApi {
  id: string;
  name: string;
  fullAddress: string;
  addressReference?: string | null;
  street?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface StoreScheduleApi {
  id: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  name?: string;
  isActive?: boolean;
}

/** User joined on cashier listing (GET /store/:id/cashiers). */
export interface CashierUserApi {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CashierProfileApi {
  id: string;
  /** Null when cashier is not assigned to a store yet. */
  storeId: string | null;
  branchOffice: string;
  cashierNumber: string;
  isApproved?: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  lastActivityAt?: string | null;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: CashierUserApi;
}

export interface StoreApi {
  id: string;
  name: string;
  businessProfileId: string;
  phoneNumber?: string | null;
  email?: string | null;
  isActive: boolean;
  dailySalesTarget?: string | number | null;
  monthlySalesTarget?: string | number | null;
  storeType?: string | null;
  location?: StoreLocationApi | null;
  schedules?: StoreScheduleApi[];
  cashiers?: CashierProfileApi[];
  paymentMethods?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ListStoresParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'isActive' | 'dailySalesTarget' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
  name?: string;
  isActive?: boolean;
}
