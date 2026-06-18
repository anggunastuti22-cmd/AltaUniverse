import { describe, expect, it } from 'vitest';
import { consentSchema, defaultConsents, preferencesSchema, profileSchema } from './core';

const uuid = '00000000-0000-4000-8000-000000000000';

describe('core validation', () => {
  it('accepts a valid profile and applies locale default', () => {
    const parsed = profileSchema.parse({
      id: uuid,
      displayName: 'Maya',
      timezone: 'Asia/Jakarta',
    });
    expect(parsed.locale).toBe('en');
  });

  it('rejects an invalid profile id', () => {
    expect(() =>
      profileSchema.parse({ id: 'not-a-uuid', displayName: 'Maya', timezone: 'UTC' }),
    ).toThrow();
  });

  it('applies preference defaults', () => {
    const prefs = preferencesSchema.parse({ userId: uuid });
    expect(prefs.theme).toBe('system');
    expect(prefs.measurementUnits).toBe('metric');
  });

  it('validates consent records', () => {
    const consent = consentSchema.parse({
      userId: uuid,
      consentType: 'ai_processing',
      granted: false,
      version: '2026-06-18',
    });
    expect(consent.granted).toBe(false);
  });

  it('defaults all consents to off (privacy by default)', () => {
    expect(defaultConsents.ai_processing).toBe(false);
    expect(defaultConsents.analytics).toBe(false);
    expect(defaultConsents.notifications).toBe(false);
  });
});
