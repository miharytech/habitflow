import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import PressableScale from '@/components/PressableScale';
import { Text, View } from '@/components/Themed';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import type { Habit } from '@/lib/types';

type Props = {
  habit: Habit;
  done: boolean;
  streak: number;
  onToggle: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
};

export default function HabitRow({ habit, done, streak, onToggle, onDelete, onEdit }: Props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <PressableScale
      onPress={onToggle}
      onLongPress={onDelete}
      scaleTo={0.98}
      style={[
        styles.row,
        {
          backgroundColor: theme.card,
          borderColor: done ? 'transparent' : theme.border,
          shadowColor: theme.shadow,
        },
      ]}>
      {done ? (
        <LinearGradient colors={Gradients.success} style={styles.check}>
          <Text style={styles.checkMark}>✓</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.check, styles.checkEmpty, { borderColor: theme.border }]} />
      )}
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.text, textDecorationLine: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }]}>
          {habit.emoji} {habit.name}
        </Text>
        <Text style={[styles.meta, { color: streak > 0 ? theme.streak : theme.muted }]}>
          {streak > 0 ? `🔥 ${streak}-day streak` : 'Start a streak today'}
        </Text>
      </View>
      {onEdit ? (
        <PressableScale onPress={onEdit} hitSlop={8} style={styles.edit}>
          <Text style={{ color: theme.tint, fontFamily: Fonts.bold, fontSize: 13 }}>Edit</Text>
        </PressableScale>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 1,
  },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkEmpty: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  checkMark: {
    fontSize: 16,
    fontFamily: Fonts.extrabold,
    color: '#fff',
    lineHeight: 18,
  },
  body: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  meta: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: Fonts.semibold,
  },
  edit: {
    paddingLeft: 8,
    backgroundColor: 'transparent',
  },
});
