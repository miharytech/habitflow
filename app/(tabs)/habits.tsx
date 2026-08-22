import { LinearGradient } from 'expo-linear-gradient';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';

import AdBanner from '@/components/AdBanner';
import HabitRow from '@/components/HabitRow';
import PressableScale from '@/components/PressableScale';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useApp } from '@/context/AppProvider';
import { useT } from '@/context/I18nContext';
import { FREE_HABIT_LIMIT, REWARD_EXTRA_SLOTS } from '@/lib/types';
import { isAdMobAvailable } from '@/lib/ads';

export default function HabitsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const {
    ready,
    state,
    waterTodayMl,
    habitLimit,
    canAddHabit,
    toggleHabit,
    isHabitDone,
    streak,
    deleteHabit,
    unlockMoreHabits,
    setWaterTrackingEnabled,
  } = useApp();
  const t = useT();

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text>{t.common.loading}</Text>
      </View>
    );
  }

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(t.habits.deleteTitle, name, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: () => deleteHabit(id) },
    ]);
  };

  const confirmRemoveWater = () => {
    Alert.alert(t.habits.removeWaterTitle, t.habits.removeWaterBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.remove,
        style: 'destructive',
        onPress: () => {
          void setWaterTrackingEnabled(false);
        },
      },
    ]);
  };

  const onUnlock = async () => {
    const ok = await unlockMoreHabits();
    if (ok) return;
    Alert.alert(
      t.rewards.unavailableTitle,
      isAdMobAvailable() ? t.rewards.adFailedBody : t.rewards.noAdHabitsBody(FREE_HABIT_LIMIT)
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>{t.habits.title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {t.habits.meta(state.habits.length, habitLimit)}
        </Text>

        {state.waterTrackingEnabled ? (
          <PressableScale
            onLongPress={confirmRemoveWater}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel={t.habits.waterTracking}
            accessibilityHint={t.habits.waterHint}
            style={[styles.waterRow, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <LinearGradient colors={Gradients.water} style={styles.waterIcon}>
              <Text style={styles.waterEmoji}>💧</Text>
            </LinearGradient>
            <View style={styles.waterBody}>
              <Text style={[styles.name, { color: theme.text }]}>{t.habits.waterTracking}</Text>
              <Text style={[styles.waterMeta, { color: theme.muted }]}>
                {t.habits.waterMeta(t.formatMl(waterTodayMl), t.formatMl(state.waterGoalMl))}
              </Text>
            </View>
          </PressableScale>
        ) : (
          <PressableScale
            onPress={() => void setWaterTrackingEnabled(true)}
            accessibilityRole="button"
            accessibilityLabel={t.habits.addWaterTracking}
            style={{ marginBottom: 10 }}>
            <LinearGradient colors={Gradients.water} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
              <Text style={styles.ctaText}>{t.habits.addWaterTracking}</Text>
            </LinearGradient>
          </PressableScale>
        )}

        {state.habits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            done={isHabitDone(habit.id)}
            streak={streak(habit.id)}
            onToggle={() => toggleHabit(habit.id)}
            onDelete={() => confirmDelete(habit.id, habit.name)}
            onEdit={() => router.push({ pathname: '/modal', params: { habitId: habit.id } })}
          />
        ))}

        {canAddHabit ? (
          <Link href="/modal" asChild>
            <PressableScale accessibilityRole="button" accessibilityLabel={t.habits.addHabitA11y}>
              <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
                <Text style={styles.ctaText}>{t.habits.addHabit}</Text>
              </LinearGradient>
            </PressableScale>
          </Link>
        ) : (
          <PressableScale
            onPress={onUnlock}
            accessibilityRole="button"
            accessibilityLabel={t.habits.unlockA11y(REWARD_EXTRA_SLOTS)}>
            <LinearGradient colors={Gradients.gem} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
              <Text style={styles.ctaText}>{t.habits.unlockCta(REWARD_EXTRA_SLOTS)}</Text>
            </LinearGradient>
          </PressableScale>
        )}

        <Text style={[styles.hint, { color: theme.muted }]}>
          {t.habits.hint(FREE_HABIT_LIMIT, REWARD_EXTRA_SLOTS)}
        </Text>
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 20 },
  title: { fontSize: 28, fontFamily: Fonts.extrabold },
  meta: { marginTop: 4, marginBottom: 18, fontFamily: Fonts.medium, fontSize: 13 },
  waterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 1,
  },
  waterIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  waterEmoji: { fontSize: 20 },
  waterBody: { flex: 1, backgroundColor: 'transparent' },
  name: { fontSize: 16, fontFamily: Fonts.bold },
  waterMeta: { marginTop: 2, fontSize: 12, fontFamily: Fonts.medium },
  cta: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 15 },
  hint: { marginTop: 14, fontSize: 13, lineHeight: 18, fontFamily: Fonts.medium },
});
