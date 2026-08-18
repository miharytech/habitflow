import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import AdBanner from '@/components/AdBanner';
import HabitRow from '@/components/HabitRow';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useApp } from '@/context/AppProvider';
import { FREE_HABIT_LIMIT, REWARD_EXTRA_SLOTS } from '@/lib/types';
import { isAdMobAvailable } from '@/lib/ads';

export default function HabitsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const {
    ready,
    state,
    habitLimit,
    canAddHabit,
    toggleHabit,
    isHabitDone,
    streak,
    deleteHabit,
    unlockMoreHabits,
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
          {state.habits.length} / {habitLimit} slots · long-press to delete
        </Text>

        {state.habits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            done={isHabitDone(habit.id)}
            streak={streak(habit.id)}
            onToggle={() => toggleHabit(habit.id)}
            onDelete={() => confirmDelete(habit.id, habit.name)}
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
          the app earns money.
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
  cta: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '800' },
  hint: { marginTop: 12, fontSize: 13, lineHeight: 18 },
});
