import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { DailyGoalProgress } from '@/lib/gamification';

type Props = {
  progress: DailyGoalProgress;
};

export default function DailyGoalBar({ progress }: Props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const parts: string[] = [];
  if (progress.need > 0) parts.push(`${progress.done}/${progress.need} habits`);
  if (progress.waterRequired) parts.push(progress.waterMet ? 'water done' : 'water');
  const label = progress.met
    ? 'Daily goal complete'
    : parts.length
      ? `Daily goal · ${parts.join(' + ')}`
      : 'Add a habit to start a daily goal';
  const total = progress.need + (progress.waterRequired ? 1 : 0);
  const current = Math.min(progress.done, progress.need) + (progress.waterRequired && progress.waterMet ? 1 : 0);
  const ratio = total === 0 ? 0 : current / total;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.title}>{label}</Text>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(ratio * 100)}%`, backgroundColor: progress.met ? theme.streak : theme.tint },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fill: {
    height: 10,
    borderRadius: 999,
  },
});
