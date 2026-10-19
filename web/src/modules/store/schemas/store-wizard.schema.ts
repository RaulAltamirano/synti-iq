import { z } from 'zod';

import { STORE_TYPE_OPTIONS } from '@/modules/store/composables/store-form-wizard.constants';
import { STORE_FORM_LIMITS } from '@/modules/store/constants/store-form-limits';
import { DAYS_OF_WEEK } from '@/modules/store/types/store-form.types';
import { validateE164Phone } from '@/modules/store/utils/phone-number';

/** ASCII single-line business email (aligned with HTML `type="email"` / typical `@IsEmail()` usage). */
const EMAIL_REGEX =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

const STORE_TYPE_VALUES = STORE_TYPE_OPTIONS.map((o) => o.value);

const dayOfWeekEnum = z.enum(
  DAYS_OF_WEEK as unknown as [(typeof DAYS_OF_WEEK)[number], ...(typeof DAYS_OF_WEEK)[number][]]
);

function optionalMaxLengthField(max: number, message: string): z.ZodString {
  return z.string().superRefine((raw, ctx) => {
    const t = raw.trim();
    if (!t) return;
    if (t.length > max) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    }
  });
}

const storeNameSchema = z.string().superRefine((raw, ctx) => {
  const t = raw.trim();
  if (!t) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required' });
    return;
  }
  if (t.length < STORE_FORM_LIMITS.STORE_NAME_MIN) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Store name must be at least ${STORE_FORM_LIMITS.STORE_NAME_MIN} characters`,
    });
  }
  if (t.length > STORE_FORM_LIMITS.STORE_NAME_MAX) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Store name must be at most ${STORE_FORM_LIMITS.STORE_NAME_MAX} characters`,
    });
  }
});

const storeTypeSchema = z.string().superRefine((raw, ctx) => {
  const t = raw.trim();
  if (!t) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required' });
    return;
  }
  if (!STORE_TYPE_VALUES.includes(t)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required' });
  }
});

const emailOptionalSchema = z.string().superRefine((raw, ctx) => {
  const s = raw.trim();
  if (!s) return;
  if (s.length > STORE_FORM_LIMITS.EMAIL_MAX_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Email must be at most ${STORE_FORM_LIMITS.EMAIL_MAX_LENGTH} characters`,
    });
    return;
  }
  if (/\s/.test(s) || /\.\./.test(s) || !EMAIL_REGEX.test(s)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid email address' });
  }
});

const phoneOptionalSchema = z.string().superRefine((raw, ctx) => {
  const message = validateE164Phone(raw);
  if (message) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  }
});

const optionalSalesTargetSchema = z.any().superRefine((val, ctx) => {
  if (val === '' || val == null) return;
  const n = typeof val === 'number' ? val : Number(val);
  if (Number.isNaN(n)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be a number' });
    return;
  }
  if (!Number.isFinite(n)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be a finite number' });
    return;
  }
  if (n < 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Minimum 0' });
    return;
  }
  if (n > STORE_FORM_LIMITS.SALES_MAX) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Maximum ${STORE_FORM_LIMITS.SALES_MAX.toLocaleString('en-US')}`,
    });
  }
});

function requiredPrimaryLocationString(max: number): z.ZodString {
  return z.string().superRefine((raw, ctx) => {
    const t = raw.trim();
    if (!t) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required' });
      return;
    }
    if (t.length > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Must be at most ${max} characters`,
      });
    }
  });
}

const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const scheduleRowSchema = z.object({
  dayOfWeek: dayOfWeekEnum,
  enabled: z.boolean(),
  openTimeHHMM: z.string(),
  closeTimeHHMM: z.string(),
});

const locationSchema = z.object({
  name: requiredPrimaryLocationString(STORE_FORM_LIMITS.LOCATION_NAME_MAX),
  fullAddress: requiredPrimaryLocationString(STORE_FORM_LIMITS.LOCATION_FULL_ADDRESS_MAX),
  addressReference: optionalMaxLengthField(
    STORE_FORM_LIMITS.LOCATION_REFERENCE_MAX,
    `Must be at most ${STORE_FORM_LIMITS.LOCATION_REFERENCE_MAX} characters`
  ),
  street: optionalMaxLengthField(
    STORE_FORM_LIMITS.LOCATION_LINE_MAX,
    `Must be at most ${STORE_FORM_LIMITS.LOCATION_LINE_MAX} characters`
  ),
  neighborhood: optionalMaxLengthField(
    STORE_FORM_LIMITS.LOCATION_LINE_MAX,
    `Must be at most ${STORE_FORM_LIMITS.LOCATION_LINE_MAX} characters`
  ),
  city: optionalMaxLengthField(
    STORE_FORM_LIMITS.LOCATION_LINE_MAX,
    `Must be at most ${STORE_FORM_LIMITS.LOCATION_LINE_MAX} characters`
  ),
  state: optionalMaxLengthField(
    STORE_FORM_LIMITS.LOCATION_LINE_MAX,
    `Must be at most ${STORE_FORM_LIMITS.LOCATION_LINE_MAX} characters`
  ),
  postalCode: optionalMaxLengthField(
    STORE_FORM_LIMITS.POSTAL_CODE_MAX,
    `Must be at most ${STORE_FORM_LIMITS.POSTAL_CODE_MAX} characters`
  ),
  country: z.string().optional(),
  coordinates: coordinatesSchema.optional(),
});

/**
 * Full wizard form values (steps 1–3). Schedule row semantics are still enforced by `validateSchedules()`.
 */
export const storeWizardSchema = z.object({
  name: storeNameSchema,
  storeType: storeTypeSchema,
  phoneNumber: phoneOptionalSchema,
  email: emailOptionalSchema,
  dailySalesTarget: optionalSalesTargetSchema,
  monthlySalesTarget: optionalSalesTargetSchema,
  isActive: z.boolean(),
  location: locationSchema,
  scheduleTimezone: z.string(),
  scheduleRows: z.array(scheduleRowSchema),
});

export type StoreWizardSchemaInput = z.input<typeof storeWizardSchema>;

/** Field paths validated on step 1 (Next / full submit). */
export const STORE_WIZARD_STEP1_FIELDS = [
  'name',
  'storeType',
  'phoneNumber',
  'email',
  'dailySalesTarget',
  'monthlySalesTarget',
] as const;

/** Field paths validated on step 2. */
export const STORE_WIZARD_STEP2_FIELDS = [
  'location.name',
  'location.fullAddress',
  'location.addressReference',
  'location.street',
  'location.neighborhood',
  'location.city',
  'location.state',
  'location.postalCode',
] as const;

export type StoreWizardStep1Field = (typeof STORE_WIZARD_STEP1_FIELDS)[number];
export type StoreWizardStep2Field = (typeof STORE_WIZARD_STEP2_FIELDS)[number];
