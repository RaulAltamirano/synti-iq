export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export interface CoordinatesForm {
  latitude: number;
  longitude: number;
}

export interface CreateLocationForm {
  name: string;
  fullAddress: string;
  addressReference?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  coordinates?: CoordinatesForm;
}

export interface StoreSchedulePayloadItem {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
}

export interface CreateStoreFormPayload {
  name: string;
  phoneNumber?: string;
  email?: string;
  isActive?: boolean;
  storeType?: string;
  dailySalesTarget?: number;
  monthlySalesTarget?: number;
  location?: CreateLocationForm;
  schedules?: StoreSchedulePayloadItem[];
}

export interface StoreScheduleFormRow {
  dayOfWeek: DayOfWeek;
  enabled: boolean;
  openTimeHHMM: string;
  closeTimeHHMM: string;
}

export interface StoreFormState {
  name: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  storeType: string;
  dailySalesTarget: number | '';
  monthlySalesTarget: number | '';
  location: CreateLocationForm;
  scheduleTimezone: string;
  scheduleRows: StoreScheduleFormRow[];
}
