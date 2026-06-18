import { z } from 'zod';

/**
 * Shared validation schemas for Alta Core entities.
 *
 * These mirror the `core_*` tables in docs/database/INITIAL_DATA_MODEL.md and
 * are intended to be reused by every surface (web, mobile, admin) and by Edge
 * Functions, so the same rules are enforced everywhere. This is foundation
 * scaffolding — not feature implementation.
 */

export const localeSchema = z
  .string()
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Expected a BCP-47 locale like "en" or "en-US"');

/** Profile (one per Alta ID). */
export const profileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).max(80),
  locale: localeSchema.default('en'),
  timezone: z.string().min(1),
  avatarPath: z.string().nullable().optional(),
});
export type Profile = z.infer<typeof profileSchema>;

/** User preferences. */
export const themePreferenceSchema = z.enum(['system', 'light', 'dark']);
export type ThemePreference = z.infer<typeof themePreferenceSchema>;

export const measurementUnitsSchema = z.enum(['metric', 'imperial']);
export type MeasurementUnits = z.infer<typeof measurementUnitsSchema>;

export const preferencesSchema = z.object({
  userId: z.string().uuid(),
  theme: themePreferenceSchema.default('system'),
  measurementUnits: measurementUnitsSchema.default('metric'),
  notifyRoutineReminders: z.boolean().default(true),
  notifyWeeklyReset: z.boolean().default(true),
});
export type Preferences = z.infer<typeof preferencesSchema>;

/**
 * Consent — granular and revocable. AI processing is off by default
 * (see CLAUDE.md §5 and PRIVACY_AND_SECURITY.md).
 */
export const consentTypeSchema = z.enum(['ai_processing', 'analytics', 'notifications']);
export type ConsentType = z.infer<typeof consentTypeSchema>;

export const consentSchema = z.object({
  userId: z.string().uuid(),
  consentType: consentTypeSchema,
  granted: z.boolean(),
  version: z.string().min(1),
});
export type Consent = z.infer<typeof consentSchema>;

/** Default consent state: everything off until the user explicitly opts in. */
export const defaultConsents: Record<ConsentType, boolean> = {
  ai_processing: false,
  analytics: false,
  notifications: false,
};
