import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import type { DailyGoalProgress } from '@/lib/gamification';

type Props = {
  progress: DailyGoalProgress;
};

export default function DailyGoalBar({ progress }: Props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { done, need, met, habitsDone, habitCount, waterCounts, waterMet } = progress;

  const empty = need === 0;
  const left = Math.max(need - done, 0);
  const title = met ? 'Daily goal complete' : empty ? 'No daily goal yet' : 'Daily goal';
  const caption = empty
    ? 'Add a habit or turn on water tracking to start a streak.'
    : met
      ? 'Your flame is safe for today.'
      : `${left} more ${left === 1 ? 'task' : 'tasks'} to keep your streak.`;

  const ratio = need === 0 ? 0 : Math.min(done / need, 1);
  const width: `${number}%` = `${ratio > 0 ? Math.max(Math.round(ratio * 100), 8) : 0}%`;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={empty ? title : `${title}: ${done} of ${need} tasks done`}
      accessibilityValue={{ min: 0, max: Math.max(need, 1), now: done }}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: met ? 'transparent' : theme.border,
          shadowColor: theme.shadow,
        },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>
          {met ? '🎉 ' : ''}
          {title}
        </Text>
        {empty ? null : (
          <Text style={[styles.counter, { color: met ? theme.streak : theme.muted }]}>
            {done}/{need}
          </Text>
        )}
      </View>

      <View style={[styles.track, { backgroundColor: theme.track }]}>
        {ratio > 0 ? (
          <LinearGradient
            colors={met ? Gradients.fire : Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width }]}
          />
        ) : null}
      </View>

      <Text style={[styles.caption, { color: theme.muted }]}>{caption}</Text>

      {empty ? null : (
        <View style={styles.chips}>
          {habitCount > 0 ? (
            <Chip
              theme={theme}
              done={habitsDone >= habitCount}
              label={`✅ ${habitsDone}/${habitCount} habits`}
            />
          ) : null}
          {waterCounts ? (
            <Chip theme={theme} done={waterMet} label={waterMet ? '💧 Water done' : '💧 Water'} />
          ) : null}
        </View>
      )}
    </View>
  );
}

function Chip({
  theme,
  done,
  label,
}: {
  theme: (typeof Colors)['light'];
  done: boolean;
  label: string;
}) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: done ? theme.successSoft : theme.track,
          borderColor: done ? 'transparent' : theme.border,
        },
      ]}>
      <Text style={[styles.chipText, { color: done ? theme.success : theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 10,
  },
  title: { fontSize: 15, fontFamily: Fonts.bold, flexShrink: 1 },
  counter: { fontSize: 14, fontFamily: Fonts.extrabold, marginLeft: 8 },
  track: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 12,
    borderRadius: 999,
  },
  caption: { marginTop: 10, fontSize: 13, fontFamily: Fonts.medium, lineHeight: 18 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontFamily: Fonts.bold },
});
