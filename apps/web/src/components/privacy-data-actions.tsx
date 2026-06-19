'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/client';
import { cancelDeletion } from '../../app/(app)/account/privacy/actions';

const card = {
  border: `1px solid ${color.border}`,
  borderRadius: radius.lg,
  padding: space.lg,
  backgroundColor: color.surface,
} as const;

const btn = {
  padding: `${space.sm}px ${space.lg}px`,
  borderRadius: radius.md,
  fontSize: fontSize.sm,
  fontWeight: 600,
  cursor: 'pointer',
} as const;

export function PrivacyDataActions({
  pendingDeletionUntil,
}: {
  pendingDeletionUntil: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | 'export' | 'delete'>(null);
  const [confirmText, setConfirmText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    setBusy('export');
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.functions.invoke('export-user-data');
      if (error) throw error;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'alta-universe-export.json';
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Your data has been exported.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Export failed.');
    } finally {
      setBusy(null);
    }
  }

  async function handleScheduleDelete() {
    if (confirmText !== 'DELETE') return;
    setBusy('delete');
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
      if (error) throw error;
      setConfirmText('');
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not schedule deletion.');
    } finally {
      setBusy(null);
    }
  }

  const purgeDate = pendingDeletionUntil
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(pendingDeletionUntil))
    : null;

  return (
    <section style={{ display: 'grid', gap: space.md, marginTop: space.xl }}>
      <h2 style={{ margin: 0 }}>Your data</h2>

      {/* Always mounted so assistive tech registers the region before updates. */}
      <p role="status" aria-live="polite" style={{ color: color.textMuted, margin: 0 }}>
        {message}
      </p>

      <div style={card}>
        <h3 style={{ margin: 0, fontSize: fontSize.base }}>Export your data</h3>
        <p style={{ color: color.textMuted, margin: `${space.xs}px 0 ${space.md}px` }}>
          Download everything you&apos;ve created across AltaMind, AltaWear, and AltaLab as a JSON
          file.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={busy !== null}
          style={{
            ...btn,
            border: `1px solid ${color.border}`,
            background: color.surface,
            color: color.textStrong,
          }}
        >
          {busy === 'export' ? 'Preparing…' : 'Export my data'}
        </button>
      </div>

      {purgeDate ? (
        <div style={{ ...card, borderColor: color.warning }}>
          <h3 style={{ margin: 0, fontSize: fontSize.base, color: color.warning }}>
            Account deletion scheduled
          </h3>
          <p style={{ color: color.textMuted, margin: `${space.xs}px 0 ${space.md}px` }}>
            Your account and all private data will be permanently deleted on{' '}
            <strong>{purgeDate}</strong>. You can still cancel until then.
          </p>
          <form action={cancelDeletion}>
            <button
              type="submit"
              style={{
                ...btn,
                border: '1px solid transparent',
                background: color.primary,
                color: color.primaryContrast,
              }}
            >
              Keep my account
            </button>
          </form>
        </div>
      ) : (
        <div style={{ ...card, borderColor: color.danger }}>
          <h3 style={{ margin: 0, fontSize: fontSize.base, color: color.danger }}>
            Delete account
          </h3>
          <p style={{ color: color.textMuted, margin: `${space.xs}px 0 ${space.md}px` }}>
            Schedules permanent deletion after a 7-day grace period (you can cancel during it). Type{' '}
            <code>DELETE</code> to confirm.
          </p>
          <input
            aria-label="Type DELETE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            style={{
              display: 'block',
              padding: space.sm,
              marginBottom: space.md,
              borderRadius: radius.md,
              border: `1px solid ${color.border}`,
              fontSize: fontSize.base,
            }}
          />
          <button
            type="button"
            onClick={handleScheduleDelete}
            disabled={busy !== null || confirmText !== 'DELETE'}
            style={{
              ...btn,
              border: '1px solid transparent',
              background: confirmText === 'DELETE' ? color.danger : color.surfaceMuted,
              color: confirmText === 'DELETE' ? color.textInverse : color.textSubtle,
            }}
          >
            {busy === 'delete' ? 'Scheduling…' : 'Schedule account deletion'}
          </button>
        </div>
      )}
    </section>
  );
}
