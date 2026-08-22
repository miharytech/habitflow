import { LinearGradient } from 'expo-linear-gradient';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import AdBanner from '@/components/AdBanner';
import PressableScale from '@/components/PressableScale';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import WaterHistory from '@/components/WaterHistory';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
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
      <View style={[styles.center, { backgroundColor: theme.background }]}>
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
        ? 'The ad did not finish loading. Please check your connection and try again in a moment.'
        : 'No ad is available right now. Please try again later.'
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>Progress</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          🔥 {state.appStreak}-day streak · best {state.longestStreak} · {state.streakFreezes} freeze
          {state.streakFreezes === 1 ? '' : 's'}
        </Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>This week</Text>
          <View style={styles.week}>
            {days.map((date) => {
              const met = isDailyGoalMet(state, date);
              const frozen = !met && state.lastStreakDate === date;
              const weekday = WEEKDAYS[weekdayIndex(date)];
              const status = met ? 'goal met' : frozen ? 'streak freeze used' : 'goal missed';
              return (
                <View
                  key={date}
                  accessible
                  accessibilityLabel={`${date}: ${status}`}
                  style={styles.day}>
                  <Text style={[styles.dayLabel, { color: theme.muted }]}>{weekday}</Text>
                  {met ? (
                    <LinearGradient colors={Gradients.fire} style={styles.dot}>
                      <Text style={styles.dotCheck}>✓</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: frozen ? theme.gem : theme.backgroundAlt,
                          borderWidth: frozen ? 0 : 1,
                          borderColor: theme.border,
                        },
                      ]}>
                      {frozen ? <Text style={styles.dotCheck}>❄</Text> : null}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <WaterHistory state={state} today={today} />

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Level {level} · {into}/{XP_PER_LEVEL} XP
          </Text>
          <View style={[styles.track, { backgroundColor: theme.backgroundAlt }]}>
            <LinearGradient
              colors={Gradients.gem}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fill, { width: `${Math.max(Math.round((into / XP_PER_LEVEL) * 100), 4)}%` }]}
            />
          </View>
          <Text style={[styles.hint, { color: theme.muted }]}>
            {state.xpTotal} XP total · 💎 {state.gems} gems
          </Text>
        </View>

        <PressableScale
          onPress={onFreeze}
          accessibilityRole="button"
          accessibilityLabel="Watch an ad for a streak freeze">
          <LinearGradient colors={Gradients.fire} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
            <Text style={styles.ctaText}>❄️ Watch an ad for a streak freeze</Text>
          </LinearGradient>
        </PressableScale>

        <Text style={[styles.section, { color: theme.text }]}>Achievements</Text>
        <View style={styles.grid}>
          {ACHIEVEMENTS.map((item) => {
            const on = unlocked.has(item.id);
            return (
              <View
                key={item.id}
                accessible
                accessibilityLabel={`${item.title}: ${item.description}. ${on ? 'Unlocked' : 'Locked'}`}
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.card,
                    borderColor: on ? 'transparent' : theme.border,
                    shadowColor: theme.shadow,
                    opacity: on ? 1 : 0.5,
                  },
                ]}>
                {on ? (
                  <LinearGradient colors={Gradients.brand} style={styles.badgeIcon}>
                    <Text style={styles.badgeEmoji}>{item.emoji}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.badgeIcon, { backgroundColor: theme.backgroundAlt }]}>
                    <Text style={styles.badgeEmoji}>🔒</Text>
                  </View>
                )}
                <Text style={[styles.badgeTitle, { color: theme.text }]}>{item.title}</Text>
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

function weekdayIndex(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 20 },
  title: { fontSize: 28, fontFamily: Fonts.extrabold },
  meta: { marginTop: 4, marginBottom: 18, fontSize: 14, fontFamily: Fonts.semibold },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bold, marginBottom: 14 },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  day: { alignItems: 'center', backgroundColor: 'transparent', gap: 8 },
  dayLabel: { fontSize: 11, fontFamily: Fonts.bold },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dotCheck: { color: '#fff', fontSize: 12, fontFamily: Fonts.extrabold },
  track: { height: 12, borderRadius: 999, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 999, minWidth: 12 },
  hint: { marginTop: 10, fontSize: 13, fontFamily: Fonts.semibold },
  cta: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaText: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 15 },
  section: { marginBottom: 12, fontSize: 19, fontFamily: Fonts.extrabold },
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
    borderRadius: 20,
    padding: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 1,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeEmoji: { fontSize: 19 },
  badgeTitle: { fontFamily: Fonts.extrabold, fontSize: 14 },
  badgeDesc: { marginTop: 4, fontSize: 12, lineHeight: 16, fontFamily: Fonts.medium },
});
