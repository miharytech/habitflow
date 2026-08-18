import { Pressable, StyleSheet, Switch } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useApp } from '@/context/AppProvider';
import { formatMl } from '@/lib/dates';

const GOALS = [1500, 2000, 2500, 3000];

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { ready, state, setWaterGoal, setRemindersEnabled } = useApp();

  if (!ready) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.label}>Daily water goal</Text>
        <View style={styles.row}>
          {GOALS.map((ml) => {
            const active = state.waterGoalMl === ml;
            return (
              <Pressable
                key={ml}
                onPress={() => setWaterGoal(ml)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.water : theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                <Text style={{ color: active ? '#fff' : theme.text, fontWeight: '700' }}>
                  {formatMl(ml)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
              <Text style={styles.cardTitle}>Water reminders</Text>
              <Text style={{ color: theme.muted, marginTop: 4 }}>
                {state.reminderHours.map((hour) => `${hour}:00`).join(' · ')}
              </Text>
            </View>
            <Switch
              value={state.remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ true: theme.tint }}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.cardTitle}>Ads & payouts</Text>
          <Text style={[styles.body, { color: theme.muted }]}>
            HabitFlow uses Google AdMob test ads in development. For a Play Store build, put your
            real app IDs in app.json and unit IDs in extra.ads. Google can pay Madagascar publishers
            by international wire transfer once you pass the $100 threshold.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'transparent' },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  body: { marginTop: 8, lineHeight: 20 },
});
