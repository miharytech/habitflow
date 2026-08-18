import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';

import AdBanner from '@/components/AdBanner';
import HabitRow from '@/components/HabitRow';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
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
      <View style={styles.center}>
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
    if (!ok) {
      Alert.alert(
        'Reward unavailable',
        isAdMobAvailable()
          ? 'The ad did not finish. Try again in a moment.'
          : 'Rewarded ads work in a development or Play Store build, not Expo Go. For now your 4 starter habits stay free.'
      );
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your habits</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {state.habits.length} / {habitLimit} slots · tap Edit to rename · long-press to delete
        </Text>

        {state.waterTrackingEnabled ? (
          <Pressable
            onLongPress={confirmRemoveWater}
            style={[styles.waterRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.waterEmoji}>💧</Text>
            <View style={styles.waterBody}>
              <Text style={styles.name}>Water tracking</Text>
              <Text style={[styles.waterMeta, { color: theme.muted }]}>
                {formatMl(waterTodayMl)} / {formatMl(state.waterGoalMl)} · long-press to remove
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.cta, { backgroundColor: theme.water, marginBottom: 10 }]}
            onPress={() => {
              void setWaterTrackingEnabled(true);
            }}>
            <Text style={styles.ctaText}>Add water tracking</Text>
          </Pressable>
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
            <Pressable style={[styles.cta, { backgroundColor: theme.tint }]}>
              <Text style={styles.ctaText}>Add habit</Text>
            </Pressable>
          </Link>
        ) : (
          <Pressable style={[styles.cta, { backgroundColor: theme.water }]} onPress={onUnlock}>
            <Text style={styles.ctaText}>
              Watch an ad to unlock {REWARD_EXTRA_SLOTS} more habits
            </Text>
          </Pressable>
        )}

        <Text style={[styles.hint, { color: theme.muted }]}>
          {FREE_HABIT_LIMIT} habits are free. Extra slots unlock with a rewarded ad — this is how
          the app earns money. Water tracking does not use a slot.
        </Text>
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800' },
  meta: { marginTop: 4, marginBottom: 16 },
  waterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  waterEmoji: { fontSize: 22, marginRight: 12 },
  waterBody: { flex: 1, backgroundColor: 'transparent' },
  name: { fontSize: 16, fontWeight: '700' },
  waterMeta: { marginTop: 2, fontSize: 12 },
  cta: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '800' },
  hint: { marginTop: 12, fontSize: 13, lineHeight: 18 },
});
