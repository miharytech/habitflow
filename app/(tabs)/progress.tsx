import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import AdBanner from '@/components/AdBanner';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useApp } from '@/context/AppProvider';
import { isAdMobAvailable } from '@/lib/ads';
import { recentDayKeys } from '@/lib/dates';
import { ACHIEVEMENTS, isDailyGoalMet, levelFromXp, xpIntoLevel } from '@/lib/gamification';
import { MAX_STREAK_FREEZES, XP_PER_LEVEL } from '@/lib/types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ProgressScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { ready, today, state, unlockStreakFreeze } = useApp();

  if (!ready) {
    return (
      <View style={styles.center}>
        <Text>Loading…</Text>
      </View>
    );
  }

  const level = levelFromXp(state.xpTotal);
  const into = xpIntoLevel(state.xpTotal);
  const days = recentDayKeys(today, 7);
  const unlocked = new Set(state.unlockedAchievementIds);

  const onFreeze = async () => {
    const result = await unlockStreakFreeze();
    if (result === 'ok') {
      Alert.alert('Streak freeze ready', 'If you miss a day, one freeze will keep your flame.');
      return;
    }
    if (result === 'full') {
      Alert.alert('Inventory full', `You already have ${MAX_STREAK_FREEZES} streak freezes.`);
      return;
    }
    Alert.alert(
      'Reward unavailable',
      isAdMobAvailable()
        ? 'The ad did not finish. Try again in a moment.'
        : 'Rewarded ads work in a development or Play Store build, not Expo Go.'
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Progress</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {state.appStreak}-day streak · best {state.longestStreak} · {state.streakFreezes} freeze
          {state.streakFreezes === 1 ? '' : 's'}
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.cardTitle}>This week</Text>
          <View style={styles.week}>
            {days.map((date) => {
              const met = isDailyGoalMet(state, date);
              const frozen = !met && state.lastStreakDate === date;
              const weekday = WEEKDAYS[addDaysIndex(date)];
              return (
                <View key={date} style={styles.day}>
                  <Text style={[styles.dayLabel, { color: theme.muted }]}>{weekday}</Text>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: met ? theme.streak : frozen ? theme.gem : theme.border,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.cardTitle}>
            Level {level} · {into}/{XP_PER_LEVEL} XP
          </Text>
          <View style={[styles.track, { backgroundColor: theme.border }]}>
            <View
              style={[styles.fill, { width: `${Math.round((into / XP_PER_LEVEL) * 100)}%`, backgroundColor: theme.gem }]}
            />
          </View>
          <Text style={[styles.hint, { color: theme.muted }]}>{state.xpTotal} XP total · {state.gems} gems</Text>
        </View>

        <Pressable style={[styles.cta, { backgroundColor: theme.streak }]} onPress={onFreeze}>
          <Text style={styles.ctaText}>Watch an ad for a streak freeze</Text>
        </Pressable>

        <Text style={styles.section}>Achievements</Text>
        <View style={styles.grid}>
          {ACHIEVEMENTS.map((item) => {
            const on = unlocked.has(item.id);
            return (
              <View
                key={item.id}
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.card,
                    borderColor: on ? theme.tint : theme.border,
                    opacity: on ? 1 : 0.55,
                  },
                ]}>
                <Text style={styles.badgeEmoji}>{item.emoji}</Text>
                <Text style={styles.badgeTitle}>{item.title}</Text>
                <Text style={[styles.badgeDesc, { color: theme.muted }]}>{item.description}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <AdBanner />
    </View>
  );
}

function addDaysIndex(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800' },
  meta: { marginTop: 4, marginBottom: 16, fontSize: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  day: { alignItems: 'center', backgroundColor: 'transparent', gap: 6 },
  dayLabel: { fontSize: 11, fontWeight: '700' },
  dot: { width: 18, height: 18, borderRadius: 9 },
  track: { height: 10, borderRadius: 999, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 999 },
  hint: { marginTop: 8, fontSize: 13 },
  cta: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaText: { color: '#fff', fontWeight: '800' },
  section: { marginBottom: 10, fontSize: 18, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'transparent',
  },
  badge: {
    width: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  badgeEmoji: { fontSize: 22, marginBottom: 6 },
  badgeTitle: { fontWeight: '800' },
  badgeDesc: { marginTop: 4, fontSize: 12, lineHeight: 16 },
});
