import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_GLASS_ML,
  DEFAULT_REMINDER_HOURS,
  DEFAULT_WATER_GOAL_ML,
  type PersistedState,
} from '@/lib/types';

const KEY = 'habitflow.state.v1';

export const emptyState = (): PersistedState => ({
  waterGoalMl: DEFAULT_WATER_GOAL_ML,
  glassMl: DEFAULT_GLASS_ML,
  extraHabitSlots: 0,
  remindersEnabled: false,
  reminderHours: DEFAULT_REMINDER_HOURS,
  habits: [
    { id: 'stretch', name: 'Stretch 5 min', emoji: '🧘', createdAt: new Date().toISOString() },
    { id: 'read', name: 'Read 10 min', emoji: '📖', createdAt: new Date().toISOString() },
    { id: 'walk', name: 'Take a walk', emoji: '🚶', createdAt: new Date().toISOString() },
    { id: 'sleep', name: 'Sleep on time', emoji: '😴', createdAt: new Date().toISOString() },
  ],
  waterLogs: [],
  completions: [],
});

export async function loadState(): Promise<PersistedState> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return emptyState();
  try {
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

export async function saveState(state: PersistedState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
