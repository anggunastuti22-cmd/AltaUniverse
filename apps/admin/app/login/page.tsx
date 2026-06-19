import { color, radius, space } from '@alta/design-tokens';
import { signIn } from './actions';

const field = {
  display: 'block',
  width: '100%',
  padding: space.sm,
  marginTop: space.xs,
  marginBottom: space.md,
  borderRadius: radius.md,
  border: `1px solid ${color.border}`,
  fontSize: 16,
} as const;

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main style={{ maxWidth: 380, margin: '0 auto', padding: space.xl }}>
      <h1>Alta Admin</h1>
      <p style={{ color: color.textMuted }}>Operator sign-in. Authorized accounts only.</p>
      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error}
        </p>
      ) : null}
      <form action={signIn}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required style={field} />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          style={field}
        />
        <button
          type="submit"
          style={{
            padding: `${space.sm}px ${space.lg}px`,
            borderRadius: radius.md,
            border: '1px solid transparent',
            backgroundColor: color.primary,
            color: color.primaryContrast,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
