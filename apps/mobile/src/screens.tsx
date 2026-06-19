import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from '@alta/ui/native';
import { toDateKey } from '@alta/domain';
import { supabase } from './lib/supabase';
import { color, fontSize, space, styles } from './theme';

function Scale({ value, onSelect }: { value: number | null; onSelect: (n: number) => void }) {
  return (
    <View style={styles.scaleRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          accessibilityRole="button"
          onPress={() => onSelect(n)}
          style={[styles.scaleDot, value === n ? styles.scaleDotActive : null]}
        >
          <Text style={styles.scaleText}>{n}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    setBusy(false);
  }
  async function signUp() {
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : 'Check your email to confirm, then sign in.');
    setBusy(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Alta Universe</Text>
      <Text style={styles.subtitle}>Understand, express, and care for yourself.</Text>
      {message ? <Text style={{ color: color.textMuted }}>{message}</Text> : null}
      <View>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <Button onPress={signIn} disabled={busy}>
        Sign in
      </Button>
      <Button variant="secondary" onPress={signUp} disabled={busy}>
        Create account
      </Button>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------

export function HomeScreen({ userId }: { userId: string }) {
  const [name, setName] = useState('there');
  const [checked, setChecked] = useState(false);
  const today = toDateKey(new Date());

  useEffect(() => {
    void (async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .maybeSingle();
      if (profile?.display_name) setName(profile.display_name.split(' ')[0] ?? 'there');
      const { data: c } = await supabase
        .from('mind_checkins')
        .select('id')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .maybeSingle();
      setChecked(!!c);
    })();
  }, [userId, today]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Good day, {name}.</Text>
      <Text style={styles.subtitle}>Capture a small thing, when you’re ready.</Text>
      <View style={styles.card}>
        <Text style={{ color: color.text, fontWeight: '600' }}>
          {checked ? 'You’ve checked in today' : 'No check-in yet today'}
        </Text>
        <Text style={styles.subtitle}>Use the Check-in tab for a one-minute reflection.</Text>
      </View>
      <Button variant="secondary" onPress={() => void supabase.auth.signOut()}>
        Sign out
      </Button>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------

export function CheckInScreen({ userId }: { userId: string }) {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const today = toDateKey(new Date());

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('mind_checkins')
        .select('mood, energy, note')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .maybeSingle();
      if (data) {
        setMood(data.mood);
        setEnergy(data.energy);
        setNote(data.note ?? '');
      }
    })();
  }, [userId, today]);

  async function save() {
    const { error } = await supabase
      .from('mind_checkins')
      .upsert(
        { user_id: userId, checkin_date: today, mood, energy, note: note.trim() || null },
        { onConflict: 'user_id,checkin_date' },
      );
    setMessage(error ? error.message : 'Saved. Thank you for checking in.');
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>How is your mind today?</Text>
      <Text style={styles.subtitle}>
        One a day, editable until midnight. No scores, no streaks.
      </Text>
      {message ? <Text style={{ color: color.success }}>{message}</Text> : null}
      <Text style={styles.label}>Mood</Text>
      <Scale value={mood} onSelect={setMood} />
      <Text style={styles.label}>Energy</Text>
      <Scale value={energy} onSelect={setEnergy} />
      <Text style={styles.label}>A note (private)</Text>
      <TextInput
        style={[styles.input, { minHeight: 90 }]}
        multiline
        value={note}
        onChangeText={setNote}
        placeholder="Anything to remember about today…"
      />
      <Button onPress={save}>Save check-in</Button>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------

interface JournalRow {
  id: string;
  body: string;
  entry_date: string;
}

export function JournalScreen({ userId }: { userId: string }) {
  const [body, setBody] = useState('');
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('mind_journal_entries')
      .select('id, body, entry_date')
      .order('entry_date', { ascending: false })
      .limit(15);
    setRows(data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!body.trim()) return;
    const { error } = await supabase
      .from('mind_journal_entries')
      .insert({ user_id: userId, body: body.trim() });
    if (error) {
      setMessage(error.message);
      return;
    }
    setBody('');
    setMessage('Saved.');
    void load();
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Quick journal</Text>
      <Text style={styles.subtitle}>Private free writing. Admin can never read it.</Text>
      {message ? <Text style={{ color: color.success }}>{message}</Text> : null}
      <TextInput
        style={[styles.input, { minHeight: 110 }]}
        multiline
        value={body}
        onChangeText={setBody}
        placeholder="Today I noticed…"
      />
      <Button onPress={save}>Save entry</Button>
      {rows.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={{ color: color.textMuted, fontSize: fontSize.xs }}>{r.entry_date}</Text>
          <Text style={{ color: color.text }}>{r.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------

interface ItemRow {
  id: string;
  name: string;
}

export function WearScreen({ userId }: { userId: string }) {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const today = toDateKey(new Date());

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from('wear_items').select('id, name').order('name');
      setItems(data ?? []);
    })();
  }, []);

  async function logWear(itemId: string, name: string) {
    const { error } = await supabase
      .from('wear_usage_logs')
      .insert({ user_id: userId, item_id: itemId, worn_on: today });
    setMessage(error ? error.message : `Logged: ${name}`);
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Log today’s outfit</Text>
      <Text style={styles.subtitle}>Tap a piece you wore. This powers cost-per-wear.</Text>
      {message ? <Text style={{ color: color.success }}>{message}</Text> : null}
      {items.length === 0 ? (
        <Text style={styles.subtitle}>No items yet — add them on the web app.</Text>
      ) : (
        items.map((it) => (
          <Pressable key={it.id} style={styles.card} onPress={() => logWear(it.id, it.name)}>
            <Text style={{ color: color.text, fontWeight: '600' }}>{it.name}</Text>
            <Text style={{ color: color.wear, fontSize: fontSize.xs }}>Tap to log a wear</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------

interface ObservationRow {
  id: string;
  observed_on: string;
  note: string | null;
}

export function LabScreen({ userId }: { userId: string }) {
  const [note, setNote] = useState('');
  const [rows, setRows] = useState<ObservationRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const today = toDateKey(new Date());

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('lab_skin_logs')
      .select('id, observed_on, note')
      .order('observed_on', { ascending: false })
      .limit(15);
    setRows(data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!note.trim()) return;
    const { error } = await supabase
      .from('lab_skin_logs')
      .insert({ user_id: userId, observed_on: today, note: note.trim() });
    if (error) {
      setMessage(error.message);
      return;
    }
    setNote('');
    setMessage('Saved.');
    void load();
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Skin observation</Text>
      <Text style={styles.subtitle}>
        Self-described and private. Educational, never a diagnosis.
      </Text>
      {message ? <Text style={{ color: color.success }}>{message}</Text> : null}
      <TextInput
        style={[styles.input, { minHeight: 90 }]}
        multiline
        value={note}
        onChangeText={setNote}
        placeholder="Skin felt balanced today…"
      />
      <Button onPress={save}>Save observation</Button>
      {rows.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={{ color: color.textMuted, fontSize: fontSize.xs }}>{r.observed_on}</Text>
          <Text style={{ color: color.text }}>{r.note}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export { space };
