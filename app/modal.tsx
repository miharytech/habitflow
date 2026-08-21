import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';

import PressableScale from '@/components/PressableScale';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useApp } from '@/context/AppProvider';
import { MAX_HABIT_NAME_LENGTH } from '@/lib/types';

const EMOJIS = ['✅', '💪', '📚', '🧘', '🚶', '💧', '🧠', '😴', '🥗', '🙏'];

export default function ModalScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const navigation = useNavigation();
  const { habitId } = useLocalSearchParams<{ habitId?: string | string[] }>();
  const id = Array.isArray(habitId) ? habitId[0] : habitId;
  const { state, addHabit, editHabit, canAddHabit, unlockMoreHabits } = useApp();
  const existing = id ? state.habits.find((habit) => habit.id === id) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '✅');

  useEffect(() => {
    navigation.setOptions({ title: existing ? 'Edit habit' : 'New habit' });
  }, [existing, navigation]);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmoji(existing.emoji);
      return;
    }
    setName('');
    setEmoji('✅');
  }, [existing]);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give this habit a short name.');
      return;
    }
    if (existing) {
      const ok = editHabit(existing.id, name, emoji);
      if (ok) router.back();
      return;
    }
    if (!canAddHabit) {
      const unlocked = await unlockMoreHabits();
      if (!unlocked) {
        Alert.alert(
          'Habit limit reached',
          'Watch a short ad from the Habits tab to unlock more slots.'
        );
        return;
      }
    }
    const result = addHabit(name, emoji);
    if (result === 'ok') {
      router.back();
      return;
    }
    Alert.alert('Habit limit reached', 'Watch a rewarded ad from the Habits tab to unlock more slots.');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>{existing ? 'Edit habit' : 'New habit'}</Text>
      <Text style={[styles.label, { color: theme.muted }]}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. No sugar"
        placeholderTextColor={theme.muted}
        maxLength={MAX_HABIT_NAME_LENGTH}
        accessibilityLabel="Habit name"
        autoFocus={!existing}
        returnKeyType="done"
        onSubmitEditing={() => void save()}
        style={[
          styles.input,
          { color: theme.text, borderColor: theme.border, backgroundColor: theme.card, fontFamily: Fonts.semibold },
        ]}
      />
      <Text style={[styles.label, { color: theme.muted }]}>Icon</Text>
      <View style={styles.emojis}>
        {EMOJIS.map((item) => {
          const active = item === emoji;
          return (
            <PressableScale
              key={item}
              onPress={() => setEmoji(item)}
              scaleTo={0.9}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Icon ${item}`}>
              {active ? (
                <LinearGradient colors={Gradients.brand} style={styles.emoji}>
                  <Text style={{ fontSize: 22 }}>{item}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.emoji, { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }]}>
                  <Text style={{ fontSize: 22 }}>{item}</Text>
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>
      <PressableScale
        onPress={save}
        style={styles.saveWrap}
        accessibilityRole="button"
        accessibilityLabel={existing ? 'Save changes' : 'Save habit'}>
        <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.save}>
          <Text style={styles.saveText}>{existing ? 'Save changes' : 'Save habit'}</Text>
        </LinearGradient>
      </PressableScale>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontFamily: Fonts.extrabold, marginBottom: 20 },
  label: { marginBottom: 8, fontFamily: Fonts.bold, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  emojis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  emoji: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveWrap: { marginTop: 28 },
  save: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 16 },
});
