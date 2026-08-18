import { Modal, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { Celebration } from '@/lib/gamification';

type Props = {
  celebration: Celebration | null;
  onDismiss: () => void;
};

export default function CelebrationModal({ celebration, onDismiss }: Props) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  if (!celebration) return null;

  const lines: string[] = [];
  if (celebration.dailyGoal) lines.push(`Daily goal complete · ${celebration.streak}-day streak`);
  if (celebration.perfectDay) lines.push('Perfect day bonus');
  if (celebration.levelUpTo) lines.push(`Level up! You reached level ${celebration.levelUpTo}`);
  for (const item of celebration.achievements) {
    lines.push(`${item.emoji} ${item.title}`);
  }

  const reward: string[] = [];
  if (celebration.xpDelta > 0) reward.push(`+${celebration.xpDelta} XP`);
  if (celebration.gemsDelta > 0) reward.push(`+${celebration.gemsDelta} gems`);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => undefined}>
          <Text style={styles.emoji}>{celebration.dailyGoal ? '🔥' : '🎉'}</Text>
          <Text style={styles.title}>{celebration.dailyGoal ? 'Nice work!' : 'You earned a reward'}</Text>
          {lines.map((line) => (
            <Text key={line} style={[styles.line, { color: theme.muted }]}>
              {line}
            </Text>
          ))}
          {reward.length ? <Text style={[styles.reward, { color: theme.streak }]}>{reward.join('  ·  ')}</Text> : null}
          <Pressable style={[styles.button, { backgroundColor: theme.tint }]} onPress={onDismiss}>
            <Text style={styles.buttonText}>Keep going</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  emoji: { fontSize: 42, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  line: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  reward: { marginTop: 12, fontSize: 16, fontWeight: '800' },
  button: {
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800' },
});
