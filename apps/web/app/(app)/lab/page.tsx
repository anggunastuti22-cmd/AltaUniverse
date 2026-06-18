import { color, fontSize, radius, space } from '@alta/design-tokens';

const items = [
  'Skin baseline (self-reported, not a diagnosis)',
  'Product cabinet',
  'Morning & evening routines',
  'Skin observation log',
  'Product experiment journal',
  'Routine cost',
];

export default function LabPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: `${space['2xl']}px ${space.xl}px` }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: color.lab,
        }}
      >
        AltaLab · care for yourself
      </span>
      <h1 style={{ fontSize: fontSize['2xl'], margin: `${space.sm}px 0` }}>
        Your skin, gently tracked
      </h1>
      <p style={{ color: color.textMuted, maxWidth: 560 }}>
        Educational, never diagnostic. Capture screens arrive in the next phase. Observations are
        private to you.
      </p>
      <ul
        style={{
          marginTop: space.lg,
          padding: space.lg,
          listStyle: 'none',
          display: 'grid',
          gap: space.sm,
          border: `1px solid ${color.border}`,
          borderLeft: `3px solid ${color.lab}`,
          borderRadius: radius.lg,
          backgroundColor: color.surface,
        }}
      >
        {items.map((i) => (
          <li key={i} style={{ color: color.text }}>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
