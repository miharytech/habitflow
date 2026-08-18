import { Pressable, ScrollView, StyleSheet, Switch } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useApp } from '@/context/AppProvider';
import { formatMl } from '@/lib/dates';
import type { DailyGoalCount } from '@/lib/types';

const GOALS = [1500, 2000, 2500, 3000];
const DAILY_GOALS: { value: DailyGoalCount; label: string }[] = [
  { value: 1, label: 'Casual · 1' },
  { value: 2, label: 'Regular · 2' },
  { value: 3, label: 'Serious · 3' },
  { value: 'all', label: 'All habits' },
];

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const {
    ready,
    state,
    setWaterGoal,
    setRemindersEnabled,
    setDailyGoalCount,
    setIncludeWaterInDailyGoal,
  } = useApp();

  if (!ready) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.label}>Daily habit goal</Text>
      <Text style={[styles.help, { color: theme.muted }]}>
        Complete this many habits to keep your flame. If you have fewer habits, the goal shrinks to match.
      </Text>
      <View style={styles.row}>
        {DAILY_GOALS.map((item) => {
          const active = state.dailyGoalCount === item.value;
          return (
            <Pressable
              key={String(item.value)}
              onPress={() => setDailyGoalCount(item.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.streak : theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={{ color: active ? '#fff' : theme.text, fontWeight: '700' }}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {state.waterTrackingEnabled ? (
        <>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={styles.cardTitle}>Include water in daily goal</Text>
                <Text style={{ color: theme.muted, marginTop: 4 }}>
                  Off: water gives bonus XP. On: you also need the water goal to keep the streak.
                </Text>
              </View>
              <Switch
                value={state.includeWaterInDailyGoal}
                onValueChange={setIncludeWaterInDailyGoal}
                trackColor={{ true: theme.tint }}
              />
            </View>
          </View>

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
        </>
      ) : (
        <Text style={[styles.help, { color: theme.muted }]}>
          Water tracking is off. Add it back from the Habits tab.
        </Text>
      )}

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.cardTitle}>Ads & payouts</Text>
        <Text style={[styles.body, { color: theme.muted }]}>
          HabitFlow uses Google AdMob test ads in development. For a Play Store build, put your
          real app IDs in app.json and unit IDs in extra.ads. Google can pay Madagascar publishers
          by international wire transfer once you pass the $100 threshold.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  help: { fontSize: 13, lineHeight: 18, marginTop: -4 },
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
