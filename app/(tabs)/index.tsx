import { Pressable, ScrollView, StyleSheet } from 'react-native';

import AdBanner from '@/components/AdBanner';
import DailyGoalBar from '@/components/DailyGoalBar';
import HabitRow from '@/components/HabitRow';
import StreakHeader from '@/components/StreakHeader';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import WaterRing from '@/components/WaterRing';
import Colors from '@/constants/Colors';
import { useApp, useDailyProgress } from '@/context/AppProvider';
import { formatMl, greeting } from '@/lib/dates';
import { QUICK_ADD_ML } from '@/lib/types';

export default function TodayScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const {
    ready,
    state,
    waterTodayMl,
    addWater,
    undoWater,
    toggleHabit,
    isHabitDone,
    streak,
  } = useApp();
  const progress = useDailyProgress();

  if (!ready) {
    return (
      <View style={styles.center}>
        <Text>Loading HabitFlow…</Text>
      </View>
    );
  }

  const remaining = Math.max(state.waterGoalMl - waterTodayMl, 0);
  const subtitle = state.waterTrackingEnabled
    ? remaining === 0
      ? 'Water goal complete. Nice work.'
      : `${formatMl(remaining)} left today`
    : progress.met
      ? 'Daily goal complete. Nice work.'
      : 'Check off habits to keep your streak.';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hello}>{greeting()}</Text>
        <Text style={[styles.sub, { color: theme.muted }]}>{subtitle}</Text>
        <StreakHeader state={state} />
        <DailyGoalBar progress={progress} />

        {state.waterTrackingEnabled ? (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <WaterRing
              ml={waterTodayMl}
              goalMl={state.waterGoalMl}
              trackColor={theme.border}
              progressColor={theme.water}
              textColor={theme.text}
              mutedColor={theme.muted}
            />
            <View style={styles.quickRow}>
              {QUICK_ADD_ML.map((ml) => (
                <Pressable
                  key={ml}
                  onPress={() => addWater(ml)}
                  style={({ pressed }) => [
                    styles.pill,
                    { backgroundColor: theme.water, opacity: pressed ? 0.8 : 1 },
                  ]}>
                  <Text style={styles.pillText}>+{ml}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={undoWater} style={styles.undo}>
              <Text style={{ color: theme.muted }}>Undo last sip</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.section}>Today’s habits</Text>
        {state.habits.length === 0 ? (
          <Text style={{ color: theme.muted }}>No habits yet. Add one from the Habits tab.</Text>
        ) : (
          state.habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              done={isHabitDone(habit.id)}
              streak={streak(habit.id)}
              onToggle={() => toggleHabit(habit.id)}
            />
          ))
        )}
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 32 },
  hello: { fontSize: 28, fontWeight: '800' },
  sub: { marginTop: 4, marginBottom: 18, fontSize: 15 },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillText: { color: '#fff', fontWeight: '700' },
  undo: { marginTop: 12, backgroundColor: 'transparent' },
  section: { marginTop: 24, marginBottom: 10, fontSize: 18, fontWeight: '700' },
});
