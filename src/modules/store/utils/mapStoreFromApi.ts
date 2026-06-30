import type {
  CashierProfileApi,
  StoreApi,
  StoreScheduleApi,
} from '@/modules/store/types/store-api.types';
import type { StoreListItem } from '@/modules/store/types/store-dashboard.types';
import type {
  StoreCashier,
  StoreDetails,
  StoreScheduleItem,
} from '@/modules/store/types/store-details.types';
import type { AutocompleteOption } from '@/modules/ui/components';

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

/** Strip Postgres / ISO time strings to HH:MM for display */
export function formatScheduleClock(raw: string): string {
  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : raw;
}

function sortSchedulesByWeekday(schedules: StoreScheduleApi[]): StoreScheduleApi[] {
  return [...schedules].sort((a, b) => {
    const ia = DAY_ORDER.indexOf(a.dayOfWeek as (typeof DAY_ORDER)[number]);
    const ib = DAY_ORDER.indexOf(b.dayOfWeek as (typeof DAY_ORDER)[number]);
    const sa = ia === -1 ? 99 : ia;
    const sb = ib === -1 ? 99 : ib;
    return sa - sb;
  });
}

function openingHoursFromSchedules(
  schedules: StoreScheduleApi[] | undefined
): { open: string; close: string } | null {
  if (!schedules?.length) return null;
  const sorted = sortSchedulesByWeekday(schedules);
  const first = sorted[0];
  return {
    open: formatScheduleClock(first.openTime),
    close: formatScheduleClock(first.closeTime),
  };
}

export function mapStoreApiToListItem(api: StoreApi): StoreListItem {
  const address = api.location?.fullAddress?.trim() || api.location?.name?.trim() || '—';

  return {
    id: api.id,
    name: api.name,
    address,
    storeType: (api.storeType ?? '').trim() || '—',
    isActive: api.isActive,
    openingHours: openingHoursFromSchedules(api.schedules),
    cashiersCount: api.cashiers?.length ?? 0,
  };
}

export function mapSchedulesToDetailsItems(
  schedules: StoreScheduleApi[] | undefined
): StoreScheduleItem[] {
  if (!schedules?.length) return [];
  return sortSchedulesByWeekday(schedules).map((s) => ({
    dayOfWeek: s.dayOfWeek,
    dayLabel: DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek,
    openTime: formatScheduleClock(s.openTime),
    closeTime: formatScheduleClock(s.closeTime),
  }));
}

/** Maps API cashier profile to token-autocomplete option (`value` = cashier profile UUID). */
export function mapCashierProfileToAssignAutocompleteOption(
  c: CashierProfileApi
): AutocompleteOption<string> {
  const u = c.user;
  const fullName = u
    ? [u.firstName, u.lastName].filter((x) => x != null && String(x).trim() !== '').join(' ')
    : '';
  const label =
    fullName.trim() ||
    (u?.email?.trim() ? u.email.trim() : '') ||
    [c.cashierNumber, c.branchOffice].filter(Boolean).join(' · ') ||
    String(c.id);
  const email = u?.email?.trim();
  return {
    value: c.id,
    label,
    description: email || undefined,
    avatarName: label,
  };
}

export function mapCashierApiToView(c: CashierProfileApi): StoreCashier {
  const u = c.user;
  const fullName = u
    ? [u.firstName, u.lastName].filter((x) => x != null && String(x).trim() !== '').join(' ')
    : '';
  const displayName =
    fullName.trim() ||
    (u?.email?.trim() ? u.email.trim() : '') ||
    [c.cashierNumber, c.branchOffice].filter(Boolean).join(' · ') ||
    String(c.id);

  const userActive = u?.isActive !== false;
  return {
    id: c.id,
    name: displayName,
    email: u?.email,
    branchOffice: c.branchOffice,
    cashierNumber: c.cashierNumber,
    status: userActive ? 'active' : 'inactive',
    isApproved: Boolean(c.isApproved),
    lastActivityAt: c.lastActivityAt ?? null,
    shiftStartTime: c.shiftStartTime ?? null,
    shiftEndTime: c.shiftEndTime ?? null,
    lastLogin: u?.lastLogin ?? null,
  };
}

export function mapStoreApiToDetails(api: StoreApi): StoreDetails {
  const address = api.location?.fullAddress?.trim() || api.location?.name?.trim() || undefined;

  return {
    id: api.id,
    name: api.name,
    phoneNumber: api.phoneNumber ?? undefined,
    email: api.email ?? undefined,
    storeType: api.storeType ?? '—',
    isActive: api.isActive,
    dailySalesTarget: toNumberOrUndefined(api.dailySalesTarget),
    monthlySalesTarget: toNumberOrUndefined(api.monthlySalesTarget),
    address,
    location: api.location
      ? {
          id: api.location.id,
          name: api.location.name,
          fullAddress: api.location.fullAddress,
          addressReference: api.location.addressReference ?? undefined,
          street: api.location.street ?? undefined,
          neighborhood: api.location.neighborhood ?? undefined,
          city: api.location.city ?? undefined,
          state: api.location.state ?? undefined,
          postalCode: api.location.postalCode ?? undefined,
          country: api.location.country ?? undefined,
        }
      : undefined,
    schedules: mapSchedulesToDetailsItems(api.schedules),
    assignedCashierProfileIds: (api.cashiers ?? []).map((c) => String(c.id)),
    cashiers: (api.cashiers ?? []).map(mapCashierApiToView),
  };
}

function toNumberOrUndefined(v: string | number | null | undefined): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}
