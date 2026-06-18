import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@alta/ui/native';
import { color, fontSize, fontWeight, radius, space } from '@alta/design-tokens';
import { env } from './src/env';

const domains = [
  { name: 'AltaMind', tagline: 'Understand yourself.', accent: color.mind },
  { name: 'AltaWear', tagline: 'Express yourself.', accent: color.wear },
  { name: 'AltaLab', tagline: 'Care for yourself.', accent: color.lab },
];

export default function App() {
  // Validate environment at startup; invalid config fails fast.
  void env;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Alta Universe</Text>
      <Text style={styles.subtitle}>Capture-first foundation. Features not implemented yet.</Text>

      {domains.map((domain) => (
        <View key={domain.name} style={[styles.card, { borderLeftColor: domain.accent }]}>
          <Text style={styles.cardTitle}>{domain.name}</Text>
          <Text style={styles.cardText}>{domain.tagline}</Text>
        </View>
      ))}

      <View style={styles.actions}>
        <Button onPress={() => undefined}>Get started</Button>
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: space.xl,
    gap: space.md,
    backgroundColor: color.background,
    flexGrow: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: color.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: color.textMuted,
    marginBottom: space.sm,
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: space.md,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: color.text,
  },
  cardText: {
    fontSize: fontSize.sm,
    color: color.textMuted,
  },
  actions: {
    marginTop: space.md,
  },
});
