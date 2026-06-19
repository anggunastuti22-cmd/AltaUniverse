'use client';

import { useState } from 'react';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/client';

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

export function PrivacyDataActions() {
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

  async function handleDelete() {
    if (confirmText !== 'DELETE') return;
    setBusy('delete');
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
      if (error) throw error;
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Deletion failed.');
      setBusy(null);
    }
  }

  return (
    <section style={{ display: 'grid', gap: space.md, marginTop: space.xl }}>
      <h2 style={{ margin: 0 }}>Your data</h2>

      {message ? (
        <p role="status" style={{ color: color.textMuted }}>
          {message}
        </p>
      ) : null}

      <div style={card}>
        <strong>Export your data</strong>
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

      <div style={{ ...card, borderColor: color.danger }}>
        <strong style={{ color: color.danger }}>Delete account</strong>
        <p style={{ color: color.textMuted, margin: `${space.xs}px 0 ${space.md}px` }}>
          This permanently deletes your account and all your private data. This cannot be undone.
          Type <code>DELETE</code> to confirm.
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
          onClick={handleDelete}
          disabled={busy !== null || confirmText !== 'DELETE'}
          style={{
            ...btn,
            border: '1px solid transparent',
            background: confirmText === 'DELETE' ? color.danger : color.surfaceMuted,
            color: confirmText === 'DELETE' ? color.textInverse : color.textSubtle,
          }}
        >
          {busy === 'delete' ? 'Deleting…' : 'Permanently delete my account'}
        </button>
      </div>
    </section>
  );
}
