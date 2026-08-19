import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Fonts } from '@/constants/Fonts';
import { Gradients } from '@/constants/Colors';
import { levelFromXp } from '@/lib/gamification';
import type { PersistedState } from '@/lib/types';

type Props = {
  state: PersistedState;
};

export default function StreakHeader({ state }: Props) {
  const level = levelFromXp(state.xpTotal);

  return (
    <View style={styles.row}>
      <Chip colors={Gradients.fire} emoji="🔥" value={state.appStreak} label="streak" />
      <Chip colors={Gradients.gem} emoji="💎" value={state.gems} label="gems" />
      <Chip colors={Gradients.brand} emoji="⚡" value={level} label="level" />
    </View>
  );
}

function Chip({
  colors,
  emoji,
  value,
  label,
}: {
  colors: readonly [string, string];
  emoji: string;
  value: number;
  label: string;
}) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chip}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 14,
    gap: 2,
  },
  emoji: { fontSize: 18 },
  value: { fontSize: 20, fontFamily: Fonts.extrabold, color: '#FFFFFF', marginTop: 2 },
  label: { fontSize: 11, fontFamily: Fonts.semibold, color: 'rgba(255,255,255,0.85)' },
});
