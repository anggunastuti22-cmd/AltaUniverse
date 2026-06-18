import { color, fontSize, radius, space } from '@alta/design-tokens';

export default function NotificationsPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: `${space['2xl']}px ${space.xl}px` }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: color.textSubtle,
        }}
      >
        Notifications
      </span>
      <h1 style={{ fontSize: fontSize['2xl'], margin: `${space.sm}px 0` }}>Notification centre</h1>
      <div
        style={{
          marginTop: space.lg,
          padding: space.xl,
          textAlign: 'center',
          border: `1px solid ${color.border}`,
          borderRadius: radius.lg,
          backgroundColor: color.surface,
          color: color.textMuted,
        }}
      >
        No notifications yet. Reminders for routines and weekly resets will appear here.
      </div>
    </div>
  );
}
