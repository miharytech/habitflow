import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { levelFromXp } from '@/lib/gamification';
import type { PersistedState } from '@/lib/types';

type Props = {
  state: PersistedState;
};

export default function StreakHeader({ state }: Props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const level = levelFromXp(state.xpTotal);

  return (
    <View style={styles.row}>
      <View style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={[styles.value, { color: theme.streak }]}>{state.appStreak}</Text>
      </View>
      <View style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={styles.emoji}>💎</Text>
        <Text style={[styles.value, { color: theme.gem }]}>{state.gems}</Text>
      </View>
      <View style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.levelLabel, { color: theme.muted }]}>LV</Text>
        <Text style={styles.value}>{level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
  },
  emoji: { fontSize: 16 },
  value: { fontSize: 16, fontWeight: '800' },
  levelLabel: { fontSize: 11, fontWeight: '800' },
});
