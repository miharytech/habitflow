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
  const parts: string[] = [];
  if (progress.need > 0) parts.push(`${progress.done}/${progress.need} habits`);
  if (progress.waterRequired) parts.push(progress.waterMet ? 'water done' : 'water');
  const label = progress.met
    ? '🎉 Daily goal complete'
    : parts.length
      ? `Daily goal · ${parts.join(' + ')}`
      : 'Add a habit to start a daily goal';
  const total = progress.need + (progress.waterRequired ? 1 : 0);
  const current = Math.min(progress.done, progress.need) + (progress.waterRequired && progress.waterMet ? 1 : 0);
  const ratio = total === 0 ? 0 : current / total;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: progress.met ? 'transparent' : theme.border,
          shadowColor: theme.shadow,
        },
      ]}>
      <Text style={[styles.title, { color: theme.text }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: theme.backgroundAlt }]}>
        <LinearGradient
          colors={progress.met ? Gradients.fire : Gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${Math.max(Math.round(ratio * 100), ratio > 0 ? 6 : 0)}%` }]}
        />
      </View>
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
  title: { fontSize: 14, fontFamily: Fonts.bold, marginBottom: 12 },
  track: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 12,
    borderRadius: 999,
    minWidth: 12,
  },
});
