import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import AdBanner from '@/components/AdBanner';
import DailyGoalBar from '@/components/DailyGoalBar';
import HabitRow from '@/components/HabitRow';
import PressableScale from '@/components/PressableScale';
import StreakHeader from '@/components/StreakHeader';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import WaterRing from '@/components/WaterRing';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useApp, useDailyProgress } from '@/context/AppProvider';
import { useT } from '@/context/I18nContext';
import { isOnLocalDay } from '@/lib/dates';
import { QUICK_ADD_ML } from '@/lib/types';

export default function TodayScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { ready, state, today, waterTodayMl, addWater, undoWater, toggleHabit, isHabitDone, streak } =
    useApp();
  const progress = useDailyProgress();
  const t = useT();

  const canUndoWater = useMemo(
    () => state.waterLogs.some((log) => isOnLocalDay(log.at, today)),
    [state.waterLogs, today]
  );

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.tint} />
        <Text style={[styles.loading, { color: theme.muted }]}>{t.today.loading}</Text>
      </View>
    );
  }

  const remaining = Math.max(state.waterGoalMl - waterTodayMl, 0);
  const subtitle = progress.met
    ? t.today.subtitleComplete
    : progress.need === 0
      ? t.today.subtitleNoGoal
      : state.waterTrackingEnabled && remaining > 0
        ? t.today.subtitleWaterLeft(t.formatMl(remaining), progress.done, progress.need)
        : t.today.subtitleTasks(progress.done, progress.need);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.hello, { color: theme.text }]}>
          {t.today.greeting(new Date().getHours())}
        </Text>
        <Text style={[styles.sub, { color: theme.muted }]}>{subtitle}</Text>
        <StreakHeader state={state} />
        <DailyGoalBar progress={progress} />

        {state.waterTrackingEnabled ? (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
            ]}>
            {progress.waterCounts ? (
              <View style={[styles.badge, { backgroundColor: theme.track }]}>
                <Text style={[styles.badgeText, { color: theme.muted }]}>
                  {t.today.waterIsATask}
                </Text>
              </View>
            ) : null}
            <WaterRing
              ml={waterTodayMl}
              goalMl={state.waterGoalMl}
              trackColor={theme.track}
              textColor={theme.text}
              mutedColor={theme.muted}
            />
            <View style={styles.quickRow}>
              {QUICK_ADD_ML.map((ml) => (
                <PressableScale
                  key={ml}
                  onPress={() => addWater(ml)}
                  scaleTo={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={t.today.addWaterA11y(ml)}>
                  <LinearGradient
                    colors={Gradients.water}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pill}>
                    <Text style={styles.pillText}>+{ml}</Text>
                  </LinearGradient>
                </PressableScale>
              ))}
            </View>
            <PressableScale
              onPress={undoWater}
              disabled={!canUndoWater}
              accessibilityRole="button"
              accessibilityLabel={t.today.undo}
              accessibilityState={{ disabled: !canUndoWater }}
              style={[styles.undo, { opacity: canUndoWater ? 1 : 0.35 }]}>
              <Text style={{ color: theme.muted, fontFamily: Fonts.semibold, fontSize: 13 }}>
                {t.today.undo}
              </Text>
            </PressableScale>
          </View>
        ) : null}

        <View style={styles.sectionRow}>
          <Text style={[styles.section, { color: theme.text }]}>{t.today.habitsSection}</Text>
          {progress.habitCount > 0 ? (
            <Text style={[styles.sectionCount, { color: theme.muted }]}>
              {progress.habitsDone}/{progress.habitCount}
            </Text>
          ) : null}
        </View>
        {state.habits.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{t.today.emptyTitle}</Text>
            <Text style={[styles.emptyBody, { color: theme.muted }]}>{t.today.emptyBody}</Text>
            <Link href="/(tabs)/habits" asChild>
              <PressableScale accessibilityRole="button" accessibilityLabel={t.today.emptyCta}>
                <LinearGradient colors={Gradients.brand} style={styles.emptyCta}>
                  <Text style={styles.emptyCtaText}>{t.today.emptyCta}</Text>
                </LinearGradient>
              </PressableScale>
            </Link>
          </View>
        ) : (
          state.habits.map((habit, i) => (
            <Animated.View key={habit.id} entering={FadeInDown.delay(i * 40).springify().damping(16)}>
              <HabitRow
                habit={habit}
                done={isHabitDone(habit.id)}
                streak={streak(habit.id)}
                onToggle={() => toggleHabit(habit.id)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loading: { fontSize: 14, fontFamily: Fonts.semibold },
  content: { padding: 20, paddingBottom: 20 },
  hello: { fontSize: 30, fontFamily: Fonts.extrabold },
  sub: { marginTop: 4, marginBottom: 20, fontSize: 15, fontFamily: Fonts.medium },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 2,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeText: { fontSize: 11, fontFamily: Fonts.bold, letterSpacing: 0.2 },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
  },
  pillText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 14 },
  undo: { marginTop: 14, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'transparent' },
  sectionRow: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  section: { fontSize: 19, fontFamily: Fonts.extrabold },
  sectionCount: { fontSize: 14, fontFamily: Fonts.bold },
  empty: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontFamily: Fonts.extrabold, marginBottom: 6 },
  emptyBody: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  emptyCta: { paddingHorizontal: 22, paddingVertical: 13, borderRadius: 16 },
  emptyCtaText: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 14 },
});
