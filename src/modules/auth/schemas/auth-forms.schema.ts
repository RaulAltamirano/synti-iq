import { z } from 'zod';

import {
  EMAIL_VALIDATION,
  NAME_VALIDATION,
  PASSWORD_VALIDATION,
} from '@/modules/auth/constants/validation.constants';

const emailSchema = z
  .string()
  .min(1, EMAIL_VALIDATION.ERROR_MESSAGES.required)
  .regex(EMAIL_VALIDATION.REGEX, EMAIL_VALIDATION.ERROR_MESSAGES.invalid);

/** Shared password rules (login, register, set password, etc.). */
export const authPasswordSchema = z
  .string()
  .min(1, PASSWORD_VALIDATION.ERROR_MESSAGES.required)
  .min(PASSWORD_VALIDATION.MIN_LENGTH, PASSWORD_VALIDATION.ERROR_MESSAGES.minLength)
  .regex(PASSWORD_VALIDATION.REGEX, PASSWORD_VALIDATION.ERROR_MESSAGES.complexity);

const personNameField = z.string().superRefine((raw, ctx) => {
  const t = raw.trim();
  if (!t) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: NAME_VALIDATION.ERROR_MESSAGES.required,
    });
    return;
  }
  if (t.length < NAME_VALIDATION.MIN_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: NAME_VALIDATION.ERROR_MESSAGES.minLength,
    });
  }
});

/** Sign-in (email + password). */
export const loginCredentialsSchema = z.object({
  email: emailSchema,
  password: authPasswordSchema,
});

export type LoginCredentialsForm = z.infer<typeof loginCredentialsSchema>;

/** Customer registration. */
export const registerCustomerSchema = z.object({
  firstName: personNameField,
  lastName: personNameField,
  email: emailSchema,
  password: authPasswordSchema,
});

export type RegisterCustomerForm = z.infer<typeof registerCustomerSchema>;

const businessNameSchema = z.string().superRefine((raw, ctx) => {
  const t = raw.trim();
  if (!t) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Business name is required' });
    return;
  }
  if (t.length < NAME_VALIDATION.MIN_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Business name must be at least 2 characters',
    });
  }
});

/** Business owner registration (main form fields). Referral code is validated separately via API. */
export const registerBusinessSchema = z.object({
  firstName: personNameField,
  lastName: personNameField,
  businessName: businessNameSchema,
  email: emailSchema,
  password: authPasswordSchema,
});

export type RegisterBusinessFormValues = z.infer<typeof registerBusinessSchema>;

/** Cashier / invitation “set password” (token comes from route, not this schema). */
export const setPasswordFormSchema = z
  .object({
    password: authPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SetPasswordFormValues = z.infer<typeof setPasswordFormSchema>;
