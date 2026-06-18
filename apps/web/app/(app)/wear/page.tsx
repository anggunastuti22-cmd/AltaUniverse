import { color, fontSize, radius, space } from '@alta/design-tokens';

const items = [
  'Style profile',
  'Wardrobe inventory + item images',
  'Outfit builder',
  'Outfit usage log',
  'Cost-per-wear',
  'Wishlist (reflection, not a buy button)',
];

export default function WearPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: `${space['2xl']}px ${space.xl}px` }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: color.wear,
        }}
      >
        AltaWear · express yourself
      </span>
      <h1 style={{ fontSize: fontSize['2xl'], margin: `${space.sm}px 0` }}>
        Your wardrobe, mindfully
      </h1>
      <p style={{ color: color.textMuted, maxWidth: 560 }}>
        Editorial and fashion-aware — never a store. Capture screens arrive in the next phase.
      </p>
      <ul
        style={{
          marginTop: space.lg,
          padding: space.lg,
          listStyle: 'none',
          display: 'grid',
          gap: space.sm,
          border: `1px solid ${color.border}`,
          borderLeft: `3px solid ${color.wear}`,
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
