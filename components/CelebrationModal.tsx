import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
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
        <BlurView
          intensity={Platform.OS === 'ios' ? 40 : 90}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.cardWrap}>
          <Pressable onPress={() => undefined}>
            <LinearGradient
              colors={celebration.dailyGoal ? Gradients.fire : Gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glowRing}>
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Animated.Text entering={FadeIn.delay(120)} style={styles.emoji}>
                  {celebration.dailyGoal ? '🔥' : '🎉'}
                </Animated.Text>
                <Text style={[styles.title, { color: theme.text }]}>
                  {celebration.dailyGoal ? 'Nice work!' : 'You earned a reward'}
                </Text>
                {lines.map((line) => (
                  <Text key={line} style={[styles.line, { color: theme.muted }]}>
                    {line}
                  </Text>
                ))}
                {reward.length ? (
                  <LinearGradient colors={Gradients.gem} style={styles.rewardPill}>
                    <Text style={styles.rewardText}>{reward.join('  ·  ')}</Text>
                  </LinearGradient>
                ) : null}
                <Pressable onPress={onDismiss} style={styles.buttonWrap}>
                  <LinearGradient
                    colors={Gradients.brand}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Keep going</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cardWrap: {
    width: '100%',
  },
  glowRing: {
    borderRadius: 32,
    padding: 2,
  },
  card: {
    borderRadius: 30,
    padding: 28,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: 10 },
  title: { fontSize: 22, fontFamily: Fonts.extrabold, marginBottom: 8 },
  line: { fontSize: 14, fontFamily: Fonts.semibold, textAlign: 'center', marginTop: 4 },
  rewardPill: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  rewardText: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 15 },
  buttonWrap: { alignSelf: 'stretch', marginTop: 22 },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 15 },
});
