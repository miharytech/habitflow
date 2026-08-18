import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useApp } from '@/context/AppProvider';

const EMOJIS = ['✅', '💪', '📚', '🧘', '🚶', '💧', '🧠', '😴', '🥗', '🙏'];

export default function ModalScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { addHabit, canAddHabit, unlockMoreHabits } = useApp();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✅');

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give this habit a short name.');
      return;
    }
    if (!canAddHabit) {
      const unlocked = await unlockMoreHabits();
      if (!unlocked) return;
    }
    const result = addHabit(name, emoji);
    if (result === 'ok') router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New habit</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. No sugar"
        placeholderTextColor={theme.muted}
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
      />
      <Text style={[styles.label, { color: theme.muted }]}>Icon</Text>
      <View style={styles.emojis}>
        {EMOJIS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setEmoji(item)}
            style={[
              styles.emoji,
              { borderColor: item === emoji ? theme.tint : theme.border, backgroundColor: theme.card },
            ]}>
            <Text style={{ fontSize: 22 }}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={save} style={[styles.save, { backgroundColor: theme.tint }]}>
        <Text style={styles.saveText}>Save habit</Text>
      </Pressable>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  label: { marginTop: 18, marginBottom: 8, fontWeight: '600' },
  emojis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
  },
  emoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  save: {
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '800' },
});
