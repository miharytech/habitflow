import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { Habit } from '@/lib/types';

type Props = {
  habit: Habit;
  done: boolean;
  streak: number;
  onToggle: () => void;
  onDelete?: () => void;
};

export default function HabitRow({ habit, done, streak, onToggle, onDelete }: Props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onDelete}
      style={({ pressed }) => [styles.row, { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 }]}>
      <View
        style={[
          styles.check,
          { borderColor: done ? theme.tint : theme.border, backgroundColor: done ? theme.tint : 'transparent' },
        ]}>
        <Text style={[styles.checkMark, { color: done ? '#fff' : 'transparent' }]}>✓</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>
          {habit.emoji} {habit.name}
        </Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {streak > 0 ? `${streak}-day streak` : 'Start a streak today'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  body: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
  },
});
