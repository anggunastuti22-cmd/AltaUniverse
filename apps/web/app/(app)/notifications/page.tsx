import { redirect } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { VisuallyHidden } from '@alta/ui';
import { createClient } from '@/lib/supabase/server';
import { CheckRemindersButton } from '@/components/check-reminders-button';
import { deleteNotification, markAllRead, markRead } from './actions';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: items } = await supabase
    .from('notifications')
    .select('id, type, title, body, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(60);

  const list = items ?? [];
  const unread = list.filter((n) => !n.read_at).length;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: `${space['2xl']}px ${space.xl}px` }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: space.md,
        }}
      >
        <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Notification centre</h1>
        {unread > 0 ? (
          <form action={markAllRead}>
            <button
              type="submit"
              style={{
                padding: `${space.xs}px ${space.md}px`,
                borderRadius: radius.md,
                border: `1px solid ${color.border}`,
                background: 'transparent',
                color: color.textMuted,
                fontSize: fontSize.sm,
                cursor: 'pointer',
              }}
            >
              Mark all read
            </button>
          </form>
        ) : null}
      </div>

      <p style={{ color: color.textMuted, marginTop: 0 }}>
        Gentle reminders for routines and your weekly reset. No streaks, no pressure.
      </p>

      <div style={{ margin: `${space.md}px 0 ${space.xl}px` }}>
        <CheckRemindersButton />
      </div>

      {list.length === 0 ? (
        <div
          style={{
            padding: space.xl,
            textAlign: 'center',
            border: `1px solid ${color.border}`,
            borderRadius: radius.lg,
            backgroundColor: color.surface,
            color: color.textMuted,
          }}
        >
          No notifications yet.
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: space.sm }}>
          {list.map((n) => (
            <li
              key={n.id}
              style={{
                border: `1px solid ${color.border}`,
                borderLeft: `3px solid ${n.read_at ? color.border : color.mind}`,
                borderRadius: radius.lg,
                padding: space.md,
                backgroundColor: n.read_at ? color.surface : color.surfaceWarm,
                display: 'flex',
                justifyContent: 'space-between',
                gap: space.md,
              }}
            >
              <div>
                {!n.read_at ? <VisuallyHidden>Unread: </VisuallyHidden> : null}
                <h2
                  style={{
                    display: 'inline',
                    margin: 0,
                    fontSize: fontSize.base,
                    fontWeight: 600,
                    color: color.text,
                  }}
                >
                  {n.title}
                </h2>
                <span
                  style={{ color: color.textSubtle, fontSize: fontSize.xs, marginLeft: space.sm }}
                >
                  {timeAgo(n.created_at)}
                </span>
                {n.body ? (
                  <p style={{ color: color.textMuted, margin: `${space.xs}px 0 0` }}>{n.body}</p>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: space.xs, flex: 'none' }}>
                {!n.read_at ? (
                  <form action={markRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button
                      type="submit"
                      aria-label="Mark read"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: color.mindText,
                        cursor: 'pointer',
                        fontSize: fontSize.sm,
                        minHeight: 24,
                        padding: `${space.xs}px ${space.sm}px`,
                      }}
                    >
                      Read
                    </button>
                  </form>
                ) : null}
                <form action={deleteNotification}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    type="submit"
                    aria-label="Delete notification"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: color.textSubtle,
                      cursor: 'pointer',
                      fontSize: fontSize.sm,
                      minHeight: 24,
                      padding: `${space.xs}px ${space.sm}px`,
                    }}
                  >
                    Dismiss
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
