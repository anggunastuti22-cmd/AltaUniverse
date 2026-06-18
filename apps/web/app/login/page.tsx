import { Button } from '@alta/ui';
import { color, space } from '@alta/design-tokens';
import { signIn, signInWithMagicLink, signUp } from './actions';

const fieldStyle = {
  display: 'block',
  width: '100%',
  padding: space.sm,
  marginTop: space.xs,
  marginBottom: space.md,
  borderRadius: 8,
  border: `1px solid ${color.border}`,
  fontSize: 16,
} as const;

const cardStyle = {
  border: `1px solid ${color.border}`,
  borderRadius: 12,
  padding: space.lg,
  marginBottom: space.lg,
  backgroundColor: color.surface,
} as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; next?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: space.xl }}>
      <h1>Sign in to Alta Universe</h1>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error}
        </p>
      ) : null}
      {sp.sent === 'magic' ? (
        <p role="status" style={{ color: color.success }}>
          Check your email for a magic sign-in link.
        </p>
      ) : null}
      {sp.sent === 'confirm' ? (
        <p role="status" style={{ color: color.success }}>
          Check your email to confirm your account, then return here.
        </p>
      ) : null}

      <section style={cardStyle} aria-labelledby="signin-h">
        <h2 id="signin-h" style={{ marginTop: 0 }}>
          Email &amp; password
        </h2>
        <form action={signIn}>
          <label htmlFor="signin-email">Email</label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            style={fieldStyle}
          />
          <label htmlFor="signin-password">Password</label>
          <input
            id="signin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            style={fieldStyle}
          />
          <Button type="submit">Sign in</Button>
        </form>
      </section>

      <section style={cardStyle} aria-labelledby="magic-h">
        <h2 id="magic-h" style={{ marginTop: 0 }}>
          Magic link
        </h2>
        <form action={signInWithMagicLink}>
          <label htmlFor="magic-email">Email</label>
          <input
            id="magic-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            style={fieldStyle}
          />
          <Button type="submit" variant="secondary">
            Email me a link
          </Button>
        </form>
      </section>

      <section style={cardStyle} aria-labelledby="signup-h">
        <h2 id="signup-h" style={{ marginTop: 0 }}>
          Create an account
        </h2>
        <form action={signUp}>
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            style={fieldStyle}
          />
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            style={fieldStyle}
          />
          <Button type="submit" variant="secondary">
            Sign up
          </Button>
        </form>
      </section>
    </main>
  );
}
