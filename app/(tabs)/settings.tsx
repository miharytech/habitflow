import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Switch } from 'react-native';

import PressableScale from '@/components/PressableScale';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
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
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <Text style={[styles.label, { color: theme.text }]}>Daily habit goal</Text>
      <Text style={[styles.help, { color: theme.muted }]}>
        Complete this many habits to keep your flame. If you have fewer habits, the goal shrinks to match.
      </Text>
      <View style={styles.row}>
        {DAILY_GOALS.map((item) => {
          const active = state.dailyGoalCount === item.value;
          return (
            <PressableScale key={String(item.value)} onPress={() => setDailyGoalCount(item.value)} scaleTo={0.94}>
              {active ? (
                <LinearGradient colors={Gradients.fire} style={styles.chip}>
                  <Text style={styles.chipTextActive}>{item.label}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.chip, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
                  <Text style={[styles.chipText, { color: theme.text }]}>{item.label}</Text>
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>

      {state.waterTrackingEnabled ? (
        <>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Include water in daily goal</Text>
                <Text style={{ color: theme.muted, marginTop: 4, fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18 }}>
                  Off: water gives bonus XP. On: you also need the water goal to keep the streak.
                </Text>
              </View>
              <Switch
                value={state.includeWaterInDailyGoal}
                onValueChange={setIncludeWaterInDailyGoal}
                trackColor={{ true: theme.tint, false: theme.border }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Daily water goal</Text>
          <View style={styles.row}>
            {GOALS.map((ml) => {
              const active = state.waterGoalMl === ml;
              return (
                <PressableScale key={ml} onPress={() => setWaterGoal(ml)} scaleTo={0.94}>
                  {active ? (
                    <LinearGradient colors={Gradients.water} style={styles.chip}>
                      <Text style={styles.chipTextActive}>{formatMl(ml)}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.chip, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
                      <Text style={[styles.chipText, { color: theme.text }]}>{formatMl(ml)}</Text>
                    </View>
                  )}
                </PressableScale>
              );
            })}
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Water reminders</Text>
                <Text style={{ color: theme.muted, marginTop: 4, fontFamily: Fonts.medium, fontSize: 13 }}>
                  {state.reminderHours.map((hour) => `${hour}:00`).join(' · ')}
                </Text>
              </View>
              <Switch
                value={state.remindersEnabled}
                onValueChange={setRemindersEnabled}
                trackColor={{ true: theme.tint, false: theme.border }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </>
      ) : (
        <Text style={[styles.help, { color: theme.muted }]}>
          Water tracking is off. Add it back from the Habits tab.
        </Text>
      )}

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Ads & payouts</Text>
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
  content: { padding: 20, gap: 12, paddingBottom: 140 },
  title: { fontSize: 28, fontFamily: Fonts.extrabold, marginBottom: 8 },
  label: { fontSize: 16, fontFamily: Fonts.bold, marginTop: 8 },
  help: { fontSize: 13, lineHeight: 18, marginTop: -4, fontFamily: Fonts.medium },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'transparent' },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  chipText: { fontFamily: Fonts.bold, fontSize: 13 },
  chipTextActive: { fontFamily: Fonts.bold, fontSize: 13, color: '#fff' },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bold },
  body: { marginTop: 8, lineHeight: 20, fontFamily: Fonts.medium },
});
