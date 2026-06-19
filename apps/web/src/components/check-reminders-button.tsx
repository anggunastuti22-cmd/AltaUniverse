'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/client';

export function CheckRemindersButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke<{ created: number; reason?: string }>(
        'enqueue-reminders',
      );
      if (error) throw error;
      const created = data?.created ?? 0;
      setMessage(
        created > 0
          ? `${created} reminder${created === 1 ? '' : 's'} added.`
          : data?.reason === 'notifications-consent-off'
            ? 'Notifications are off — enable them in your privacy centre.'
            : 'No new reminders right now.',
      );
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not check reminders.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        style={{
          padding: `${space.sm}px ${space.lg}px`,
          borderRadius: radius.md,
          border: `1px solid ${color.border}`,
          background: color.surface,
          color: color.textStrong,
          fontSize: fontSize.sm,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {busy ? 'Checking…' : 'Check for reminders'}
      </button>
      {/* Always mounted so assistive tech announces the result when it arrives. */}
      <span
        role="status"
        aria-live="polite"
        style={{ color: color.textMuted, fontSize: fontSize.sm }}
      >
        {message}
      </span>
    </div>
  );
}
