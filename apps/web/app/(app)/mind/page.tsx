import { color, fontSize, radius, space } from '@alta/design-tokens';

const items = [
  'Daily check-in (one a day, editable until midnight)',
  'Guided journal',
  'Life domains',
  'Goals & progress',
  'Weekly reset',
  'Decision room (reflective, never decides for you)',
];

export default function MindPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: `${space['2xl']}px ${space.xl}px` }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: color.mind,
        }}
      >
        AltaMind · understand yourself
      </span>
      <h1 style={{ fontSize: fontSize['2xl'], margin: `${space.sm}px 0` }}>Your mind, reflected</h1>
      <p style={{ color: color.textMuted, maxWidth: 560 }}>
        Reflective, never judgmental. Capture screens arrive in the next phase. Everything here is
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
          borderLeft: `3px solid ${color.mind}`,
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
