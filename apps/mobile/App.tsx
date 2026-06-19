import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';
import { env } from './src/env';
import { color, fontSize, space } from './src/theme';
import {
  AuthScreen,
  CheckInScreen,
  HomeScreen,
  JournalScreen,
  LabScreen,
  WearScreen,
} from './src/screens';

const TABS = ['Home', 'Check-in', 'Journal', 'Wear', 'Lab'] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  // Validate environment at startup.
  void env;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Home');

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color.background,
        }}
      >
        <ActivityIndicator color={color.mind} />
      </View>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
        <AuthScreen />
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  const userId = session.user.id;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flex: 1 }}>
        {tab === 'Home' ? <HomeScreen userId={userId} /> : null}
        {tab === 'Check-in' ? <CheckInScreen userId={userId} /> : null}
        {tab === 'Journal' ? <JournalScreen userId={userId} /> : null}
        {tab === 'Wear' ? <WearScreen userId={userId} /> : null}
        {tab === 'Lab' ? <LabScreen userId={userId} /> : null}
      </View>
      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: color.border,
          backgroundColor: color.surfaceMuted,
        }}
      >
        {TABS.map((t) => (
          <Pressable
            key={t}
            accessibilityRole="button"
            onPress={() => setTab(t)}
            style={{ flex: 1, paddingVertical: space.md, alignItems: 'center' }}
          >
            <Text
              style={{
                color: tab === t ? color.text : color.textMuted,
                fontWeight: tab === t ? '600' : '400',
                fontSize: fontSize.xs,
              }}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
