import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@alta/ui';
import { color, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '../login/actions';

const domains = [
  { name: 'AltaMind', tagline: 'Understand yourself.', accent: color.mind },
  { name: 'AltaWear', tagline: 'Express yourself.', accent: color.wear },
  { name: 'AltaLab', tagline: 'Care for yourself.', accent: color.lab },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarded_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.onboarded_at) redirect('/onboarding');

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: space.xl }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Alta Home</h1>
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </header>

      <p style={{ color: color.textMuted }}>
        Welcome, {profile.display_name}. Your three domains, one system.
      </p>

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: space.md }}>
        {domains.map((domain) => (
          <li
            key={domain.name}
            style={{
              borderLeft: `4px solid ${domain.accent}`,
              padding: `${space.sm}px ${space.md}px`,
              backgroundColor: color.surface,
              borderRadius: 8,
            }}
          >
            <strong>{domain.name}</strong> — {domain.tagline}
          </li>
        ))}
      </ul>

      <p style={{ marginTop: space.xl }}>
        <Link href="/account/privacy">Privacy &amp; consent centre</Link>
      </p>
    </main>
  );
}
