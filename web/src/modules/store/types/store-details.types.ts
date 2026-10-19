/**
 * Store detail / cashiers views (mapped from API).
 */

export interface StoreCashier {
  id: string | number;
  name: string;
  email?: string;
  branchOffice?: string;
  cashierNumber?: string;
  /** Legacy badge: user active vs inactive — prefer `isApproved` for caja approval. */
  status?: 'active' | 'inactive';
  isApproved?: boolean;
  lastActivityAt?: string | null;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
  lastLogin?: string | null;
}

export interface StoreScheduleItem {
  dayOfWeek: string;
  dayLabel: string;
  openTime: string;
  closeTime: string;
}

export interface StoreLocation {
  id: string;
  name?: string;
  fullAddress?: string;
  addressReference?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface StoreDetails {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  storeType: string;
  isActive: boolean;
  dailySalesTarget?: number;
  monthlySalesTarget?: number;
  address?: string;
  location?: StoreLocation;
  schedules: StoreScheduleItem[];
  /** Profile IDs from GET /store/:id (embedded cashiers); used for exclude lists. */
  assignedCashierProfileIds?: string[];
  cashiers: StoreCashier[];
}
