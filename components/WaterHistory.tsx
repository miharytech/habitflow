import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import PressableScale from '@/components/PressableScale';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useT } from '@/context/I18nContext';
import { localDateFromKey, recentDayKeys } from '@/lib/dates';
import { waterMlOnDay, waterTotalsByDay } from '@/lib/gamification';
import type { PersistedState } from '@/lib/types';

const BAR_HEIGHT = 84;
const DAYS = 7;

type Props = {
  state: PersistedState;
  today: string;
};

/**
 * Every sip is kept as a dated log for 90 days, so the day totals here are
 * derived the same way the goal is — never from a counter that could drift.
 */
export default function WaterHistory({ state, today }: Props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const t = useT();

  if (!state.waterTrackingEnabled) return null;

  const goal = state.waterGoalMl;
  const days = recentDayKeys(today, DAYS).map((date) => {
    const ml = waterMlOnDay(state, date);
    return { date, ml, met: ml >= goal };
  });

  const total = days.reduce((sum, day) => sum + day.ml, 0);
  const metCount = days.filter((day) => day.met).length;
  const todayMl = days[days.length - 1]?.ml ?? 0;

  let allTimeMl = 0;
  let allTimeDays = 0;
  for (const ml of waterTotalsByDay(state).values()) {
    if (ml <= 0) continue;
    allTimeMl += ml;
    allTimeDays += 1;
  }

  return (
    <PressableScale
      onPress={() => router.push('/water-history')}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={t.hydration.cardA11y}
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t.hydration.title}</Text>
        <Text style={[styles.headerValue, { color: theme.water }]}>
          {t.hydration.header(t.formatMl(todayMl), t.formatMl(goal))}
        </Text>
      </View>

      <View style={styles.chart}>
        {days.map((day) => {
          const ratio = goal > 0 ? Math.min(day.ml / goal, 1) : 0;
          const height = day.ml > 0 ? Math.max(Math.round(ratio * BAR_HEIGHT), 5) : 0;
          return (
            <View
              key={day.date}
              accessible
              accessibilityLabel={t.hydration.barA11y(
                t.dates.long(localDateFromKey(day.date)),
                t.formatMl(day.ml),
                t.formatMl(goal),
                day.met
              )}
              style={styles.column}>
              <View style={[styles.track, { backgroundColor: theme.track }]}>
                {height > 0 ? (
                  day.met ? (
                    <LinearGradient
                      colors={Gradients.water}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                      style={[styles.bar, { height }]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.bar,
                        // A pale wash reads as "partial" on light; on dark it
                        // needs more of the colour to stay above the track.
                        { height, backgroundColor: theme.water, opacity: scheme === 'dark' ? 0.55 : 0.32 },
                      ]}
                    />
                  )
                ) : null}
              </View>
              <Text style={[styles.dayLabel, { color: day.met ? theme.water : theme.muted }]}>
                {t.dates.weekdayInitials[localDateFromKey(day.date).getDay()]}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.hint, { color: theme.muted }]}>
        {t.hydration.footer(
          t.formatMl(total),
          t.formatMl(Math.round(total / DAYS)),
          metCount,
          DAYS
        )}
      </Text>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.footerText, { color: theme.muted }]}>
          {allTimeDays > 0
            ? t.hydration.allTime(t.formatMl(allTimeMl), allTimeDays)
            : t.hydration.allTimeEmpty}
        </Text>
        <Text style={[styles.footerLink, { color: theme.tint }]}>{t.hydration.seeAll}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bold },
  headerValue: { fontSize: 13, fontFamily: Fonts.extrabold, marginLeft: 8 },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  column: { alignItems: 'center', backgroundColor: 'transparent', gap: 8, flex: 1 },
  track: {
    width: 18,
    height: BAR_HEIGHT,
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: { width: 18, borderRadius: 9 },
  dayLabel: { fontSize: 11, fontFamily: Fonts.bold },
  hint: { marginTop: 12, fontSize: 13, fontFamily: Fonts.semibold, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
  },
  footerText: { fontSize: 12, fontFamily: Fonts.medium, flexShrink: 1 },
  footerLink: { fontSize: 13, fontFamily: Fonts.extrabold },
});
