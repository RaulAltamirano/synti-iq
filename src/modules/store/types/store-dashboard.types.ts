/**
 * Store dashboard list row (mapped from API `Store`).
 */

export interface StoreOpeningHours {
  open: string;
  close: string;
}

export interface StoreListItem {
  id: string;
  name: string;
  storeType: string;
  address: string;
  isActive: boolean;
  openingHours: StoreOpeningHours | null;
  cashiersCount: number;
}

/** @deprecated Prefer `StoreListItem` — kept for components that still import `Store`. */
export type Store = StoreListItem;

export interface StoreFilters {
  search: string;
  status: string;
}

export interface StoreStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}
