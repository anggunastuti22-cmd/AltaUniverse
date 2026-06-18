import { redirect } from 'next/navigation';
import { Button } from '@alta/ui';
import { color, space } from '@alta/design-tokens';
import type { ConsentType } from '@alta/validation';
import { createClient } from '@/lib/supabase/server';
import { setConsent } from './actions';

const CONSENTS: { type: ConsentType; label: string; description: string }[] = [
  {
    type: 'analytics',
    label: 'Analytics',
    description: 'Privacy-safe, aggregated metrics only. Never your private content.',
  },
  {
    type: 'notifications',
    label: 'Notifications',
    description: 'Reminders and notifications.',
  },
  {
    type: 'ai_processing',
    label: 'AI processing',
    description: 'Off by default. Reflection/education only — never diagnosis or final decisions.',
  },
];

export default async function PrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: rows } = await supabase
    .from('user_consents')
    .select('consent_type, granted')
    .eq('user_id', user.id);

  const granted = new Map<string, boolean>((rows ?? []).map((r) => [r.consent_type, r.granted]));

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: space.xl }}>
      <h1>Privacy &amp; consent centre</h1>
      <p style={{ color: color.textMuted }}>
        Consent is granular and revocable. Changes take effect immediately.
      </p>

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: space.md }}>
        {CONSENTS.map((c) => {
          const isOn = granted.get(c.type) ?? false;
          return (
            <li
              key={c.type}
              style={{
                border: `1px solid ${color.border}`,
                borderRadius: 12,
                padding: space.md,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: space.md,
              }}
            >
              <div>
                <strong>{c.label}</strong>
                <span
                  style={{
                    marginLeft: space.sm,
                    color: isOn ? color.success : color.textMuted,
                    fontSize: 14,
                  }}
                >
                  {isOn ? 'On' : 'Off'}
                </span>
                <p style={{ color: color.textMuted, margin: `${space.xs}px 0 0` }}>
                  {c.description}
                </p>
              </div>
              <form action={setConsent}>
                <input type="hidden" name="consent_type" value={c.type} />
                <input type="hidden" name="granted" value={isOn ? 'false' : 'true'} />
                <Button type="submit" variant={isOn ? 'secondary' : 'primary'}>
                  {isOn ? 'Disable' : 'Enable'}
                </Button>
              </form>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
