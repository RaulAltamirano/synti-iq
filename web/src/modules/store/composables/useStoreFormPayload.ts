import type {
  CreateStoreFormPayload,
  StoreFormState,
  StoreScheduleFormRow,
  StoreSchedulePayloadItem,
  CreateLocationForm,
  DayOfWeek,
} from '../types/store-form.types';
import { DAYS_OF_WEEK } from '../types/store-form.types';

const DEFAULT_TZ = '-06:00';

function defaultLocation(): CreateLocationForm {
  return {
    name: '',
    fullAddress: '',
    addressReference: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    coordinates: { latitude: 0, longitude: 0 },
  };
}

function defaultScheduleRows(): StoreScheduleFormRow[] {
  return DAYS_OF_WEEK.map((dayOfWeek) => ({
    dayOfWeek,
    enabled: dayOfWeek !== 'sunday',
    openTimeHHMM: '09:00',
    closeTimeHHMM: '18:00',
  }));
}

export function getInitialFormState(): StoreFormState {
  return {
    name: '',
    phoneNumber: '',
    email: '',
    isActive: true,
    storeType: '',
    dailySalesTarget: '',
    monthlySalesTarget: '',
    location: defaultLocation(),
    scheduleTimezone: DEFAULT_TZ,
    scheduleRows: defaultScheduleRows(),
  };
}

function toTimeWithTz(hhmm: string, tz: string): string {
  if (!hhmm || !tz) return '';
  return `${hhmm}${tz.startsWith('-') || tz.startsWith('+') ? tz : `-${tz}`}`;
}

export function formToPayload(state: StoreFormState): CreateStoreFormPayload {
  const payload: CreateStoreFormPayload = {
    name: state.name.trim(),
  };

  if (state.phoneNumber?.trim()) payload.phoneNumber = state.phoneNumber.trim();
  if (state.email?.trim()) payload.email = state.email.trim();
  payload.isActive = state.isActive;
  if (state.storeType?.trim()) payload.storeType = state.storeType.trim();

  const daily = state.dailySalesTarget;
  if (daily !== '' && typeof daily === 'number' && daily >= 0) payload.dailySalesTarget = daily;
  if (typeof daily === 'string' && daily !== '' && !Number.isNaN(Number(daily)))
    payload.dailySalesTarget = Number(daily);

  const monthly = state.monthlySalesTarget;
  if (monthly !== '' && typeof monthly === 'number' && monthly >= 0)
    payload.monthlySalesTarget = monthly;
  if (typeof monthly === 'string' && monthly !== '' && !Number.isNaN(Number(monthly)))
    payload.monthlySalesTarget = Number(monthly);

  if (state.location?.name?.trim() || state.location?.fullAddress?.trim()) {
    const loc = state.location;
    payload.location = {
      name: loc.name?.trim() ?? '',
      fullAddress: loc.fullAddress?.trim() ?? '',
    };
    if (loc.addressReference?.trim())
      payload.location.addressReference = loc.addressReference.trim();
    if (loc.street?.trim()) payload.location.street = loc.street.trim();
    if (loc.neighborhood?.trim()) payload.location.neighborhood = loc.neighborhood.trim();
    if (loc.city?.trim()) payload.location.city = loc.city.trim();
    if (loc.state?.trim()) payload.location.state = loc.state.trim();
    if (loc.postalCode?.trim()) payload.location.postalCode = loc.postalCode.trim();
    if (loc.country?.trim()) payload.location.country = loc.country.trim();
    if (loc.coordinates != null) {
      const lat = Number(loc.coordinates.latitude);
      const lng = Number(loc.coordinates.longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng))
        payload.location.coordinates = { latitude: lat, longitude: lng };
    }
  }

  const tz = state.scheduleTimezone || DEFAULT_TZ;
  const scheduleItems: StoreSchedulePayloadItem[] = (state.scheduleRows ?? [])
    .filter((row) => row.enabled && row.openTimeHHMM && row.closeTimeHHMM)
    .map((row) => ({
      dayOfWeek: row.dayOfWeek as DayOfWeek,
      openTime: toTimeWithTz(row.openTimeHHMM, tz),
      closeTime: toTimeWithTz(row.closeTimeHHMM, tz),
    }));

  if (scheduleItems.length > 0) payload.schedules = scheduleItems;

  return payload;
}
