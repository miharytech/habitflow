import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '@/components/PressableScale';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import WaterChart from '@/components/WaterChart';
import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useApp } from '@/context/AppProvider';
import { formatMl, localDateFromKey } from '@/lib/dates';
import { buildWaterSeries, WATER_RANGES, type WaterRange } from '@/lib/waterStats';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function WaterHistoryScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { state, today } = useApp();
  const [range, setRange] = useState<WaterRange>('30d');

  const series = useMemo(() => buildWaterSeries(state, range, today), [state, range, today]);
  const goalPercent = Math.round((series.averageMl / Math.max(state.waterGoalMl, 1)) * 100);
  const consistency = series.daysInRange
    ? Math.round((series.daysMet / series.daysInRange) * 100)
    : 0;

  const bucketNote =
    series.bucket === 'day'
      ? 'One point per day'
      : series.bucket === 'week'
        ? 'One point per week — daily average'
        : 'One point per month — daily average';

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.rangeRow}>
          {WATER_RANGES.map((option) => {
            const on = option.id === range;
            return (
              <PressableScale
                key={option.id}
                onPress={() => setRange(option.id)}
                scaleTo={0.94}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={option.a11y}
                style={[
                  styles.rangeChip,
                  {
                    backgroundColor: on ? theme.tint : theme.card,
                    borderColor: on ? 'transparent' : theme.border,
                  },
                ]}>
                <Text style={[styles.rangeText, { color: on ? theme.onTint : theme.muted }]}>
                  {option.label}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        {series.daysTracked === 0 ? (
          <View style={[styles.card, cardStyle(theme), styles.empty]}>
            <Text style={styles.emptyEmoji}>💧</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Nothing logged yet</Text>
            <Text style={[styles.emptyBody, { color: theme.muted }]}>
              Add water from the Today tab and this chart starts filling in. Daily totals are kept
              for good, so you can come back to them years from now.
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.card, cardStyle(theme)]}>
              <Text style={[styles.eyebrow, { color: theme.muted }]}>Daily average</Text>
              <View style={styles.heroRow}>
                <Text style={[styles.hero, { color: theme.text }]}>{formatMl(series.averageMl)}</Text>
                <Text style={[styles.heroMeta, { color: theme.water }]}>{goalPercent}% of goal</Text>
              </View>
              <Text style={[styles.heroSub, { color: theme.muted }]}>
                {rangeSentence(series.from, series.to, series.daysInRange)}
              </Text>

              <WaterChart
                points={series.points}
                goalMl={state.waterGoalMl}
                averageMl={series.averageMl}
                lineColor={theme.water}
                gridColor={theme.border}
                labelColor={theme.muted}
                goalColor={theme.tint}
                accessibilityLabel={`Water intake chart. ${bucketNote}. Daily average ${formatMl(
                  series.averageMl
                )} against a ${formatMl(state.waterGoalMl)} goal.`}
              />

              <View style={styles.legend}>
                <Legend color={theme.tint} label={`Goal ${formatMl(state.waterGoalMl)}`} dashed />
                <Legend color={theme.muted} label="Your average" dashed />
                <Text style={[styles.legendNote, { color: theme.muted }]}>{bucketNote}</Text>
              </View>
            </View>

            <View style={styles.grid}>
              <Stat
                theme={theme}
                label="Days on goal"
                value={`${series.daysMet}/${series.daysInRange}`}
                hint={`${consistency}% of days`}
              />
              <Stat
                theme={theme}
                label="Total volume"
                value={formatMl(series.totalMl)}
                hint={`${series.daysTracked} ${series.daysTracked === 1 ? 'day' : 'days'} logged`}
              />
              <Stat
                theme={theme}
                label="Best day"
                value={series.bestDay ? formatMl(series.bestDay.ml) : '—'}
                hint={series.bestDay ? longDayLabel(series.bestDay.date) : 'No water logged'}
              />
              <Stat
                theme={theme}
                label="Tracking since"
                value={series.firstDay ? longDayLabel(series.firstDay) : '—'}
                hint={series.firstDay ? `${daysBetween(series.firstDay, today)} days of history` : ''}
              />
            </View>

            <Text style={[styles.footnote, { color: theme.muted }]}>
              Every sip is kept for 90 days; each day&apos;s total is kept for good, so the All view
              keeps growing year after year.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDash,
          { backgroundColor: color, opacity: dashed ? 0.75 : 1 },
        ]}
      />
      <Text style={[styles.legendText, { color }]}>{label}</Text>
    </View>
  );
}

function Stat({
  theme,
  label,
  value,
  hint,
}: {
  theme: (typeof Colors)['light'];
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}. ${hint}`}
      style={[styles.statCard, cardStyle(theme)]}>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      {hint ? <Text style={[styles.statHint, { color: theme.muted }]}>{hint}</Text> : null}
    </View>
  );
}

function cardStyle(theme: (typeof Colors)['light']) {
  return { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow };
}

function longDayLabel(key: string) {
  const date = localDateFromKey(key);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function daysBetween(from: string, to: string) {
  const ms = localDateFromKey(to).getTime() - localDateFromKey(from).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

function rangeSentence(from: string, to: string, days: number) {
  if (days <= 1) return longDayLabel(to);
  return `${longDayLabel(from)} → ${longDayLabel(to)} · ${days} days`;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 12 },
  rangeRow: { flexDirection: 'row', gap: 8, backgroundColor: 'transparent' },
  rangeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  rangeText: { fontSize: 13, fontFamily: Fonts.extrabold },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  eyebrow: { fontSize: 12, fontFamily: Fonts.bold, letterSpacing: 0.6, textTransform: 'uppercase' },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  hero: { fontSize: 34, fontFamily: Fonts.extrabold },
  heroMeta: { fontSize: 14, fontFamily: Fonts.extrabold },
  heroSub: { marginTop: 2, marginBottom: 8, fontSize: 12, fontFamily: Fonts.medium },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' },
  legendDash: { width: 14, height: 2, borderRadius: 2 },
  legendText: { fontSize: 11, fontFamily: Fonts.bold },
  legendNote: { fontSize: 11, fontFamily: Fonts.medium },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, backgroundColor: 'transparent' },
  statCard: {
    width: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 1,
  },
  statLabel: { fontSize: 11, fontFamily: Fonts.bold, letterSpacing: 0.4, textTransform: 'uppercase' },
  statValue: { marginTop: 6, fontSize: 20, fontFamily: Fonts.extrabold },
  statHint: { marginTop: 2, fontSize: 12, fontFamily: Fonts.medium },
  footnote: { marginTop: 4, fontSize: 12, lineHeight: 17, fontFamily: Fonts.medium },
  empty: { alignItems: 'center', gap: 6, paddingVertical: 32 },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { fontSize: 17, fontFamily: Fonts.extrabold },
  emptyBody: { fontSize: 13, lineHeight: 19, fontFamily: Fonts.medium, textAlign: 'center' },
});
