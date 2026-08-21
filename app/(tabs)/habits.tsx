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
import { FREE_HABIT_LIMIT, REWARD_EXTRA_SLOTS } from '@/lib/types';
import { isAdMobAvailable } from '@/lib/ads';
import { formatMl } from '@/lib/dates';

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

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text>Loading…</Text>
      </View>
    );
  }

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete habit?', name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
    ]);
  };

  const confirmRemoveWater = () => {
    Alert.alert('Remove water tracking?', 'You can add it back later. Your sip history stays on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
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
      'Reward unavailable',
      isAdMobAvailable()
        ? 'The ad did not finish loading. Please check your connection and try again in a moment.'
        : `No ad is available right now. Your ${FREE_HABIT_LIMIT} free habits stay available.`
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>Your habits</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {state.habits.length} / {habitLimit} slots · tap Edit to rename · long-press to delete
        </Text>

        {state.waterTrackingEnabled ? (
          <PressableScale
            onLongPress={confirmRemoveWater}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Water tracking"
            accessibilityHint="Long press to remove water tracking"
            style={[styles.waterRow, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <LinearGradient colors={Gradients.water} style={styles.waterIcon}>
              <Text style={styles.waterEmoji}>💧</Text>
            </LinearGradient>
            <View style={styles.waterBody}>
              <Text style={[styles.name, { color: theme.text }]}>Water tracking</Text>
              <Text style={[styles.waterMeta, { color: theme.muted }]}>
                {formatMl(waterTodayMl)} / {formatMl(state.waterGoalMl)} · long-press to remove
              </Text>
            </View>
          </PressableScale>
        ) : (
          <PressableScale
            onPress={() => void setWaterTrackingEnabled(true)}
            accessibilityRole="button"
            accessibilityLabel="Add water tracking"
            style={{ marginBottom: 10 }}>
            <LinearGradient colors={Gradients.water} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
              <Text style={styles.ctaText}>💧 Add water tracking</Text>
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
            <PressableScale accessibilityRole="button" accessibilityLabel="Add habit">
              <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
                <Text style={styles.ctaText}>+ Add habit</Text>
              </LinearGradient>
            </PressableScale>
          </Link>
        ) : (
          <PressableScale
            onPress={onUnlock}
            accessibilityRole="button"
            accessibilityLabel={`Watch an ad to unlock ${REWARD_EXTRA_SLOTS} more habit slots`}>
            <LinearGradient colors={Gradients.gem} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
              <Text style={styles.ctaText}>🎬 Watch an ad to unlock {REWARD_EXTRA_SLOTS} more habits</Text>
            </LinearGradient>
          </PressableScale>
        )}

        <Text style={[styles.hint, { color: theme.muted }]}>
          {FREE_HABIT_LIMIT} habits are free. Watching a short ad unlocks {REWARD_EXTRA_SLOTS} more
          slots and keeps HabitFlow free for everyone. Water tracking never uses a slot.
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
