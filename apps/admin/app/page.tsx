import { color, space } from '@alta/design-tokens';

export default function AdminHomePage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: space.xl }}>
      <h1>Alta Admin</h1>
      <p style={{ color: color.textMuted }}>
        Operator console foundation. By design, this app manages operational/public content and
        anonymized analytics only — it has no access to private user entries.
      </p>
    </main>
  );
}
