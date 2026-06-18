import { describe, expect, it } from 'vitest';
import { err, ok } from './result';
import { isSameDay, toDateKey } from './date';

describe('result', () => {
  it('models success and failure', () => {
    const good = ok(42);
    const bad = err(new Error('nope'));
    expect(good.ok).toBe(true);
    expect(bad.ok).toBe(false);
    if (good.ok) expect(good.value).toBe(42);
    if (!bad.ok) expect(bad.error.message).toBe('nope');
  });
});

describe('date', () => {
  it('produces a YYYY-MM-DD key', () => {
    const d = new Date('2026-06-18T10:00:00.000Z');
    expect(toDateKey(d, 'UTC')).toBe('2026-06-18');
  });

  it('respects timezone boundaries', () => {
    // 23:30 UTC is already the next day in Tokyo (UTC+9).
    const d = new Date('2026-06-18T23:30:00.000Z');
    expect(toDateKey(d, 'UTC')).toBe('2026-06-18');
    expect(toDateKey(d, 'Asia/Tokyo')).toBe('2026-06-19');
  });

  it('compares same-day across instants', () => {
    const a = new Date('2026-06-18T01:00:00.000Z');
    const b = new Date('2026-06-18T20:00:00.000Z');
    expect(isSameDay(a, b, 'UTC')).toBe(true);
  });
});
