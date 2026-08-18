import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

let syncChain: Promise<void> = Promise.resolve();

export async function requestReminderPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (isAllowed(current)) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return isAllowed(asked);
}

export function syncWaterReminders(enabled: boolean, hours: number[]): Promise<boolean> {
  const task = syncChain.then(() => applyWaterReminders(enabled, hours));
  syncChain = task.then(
    () => undefined,
    () => undefined
  );
  return task.catch(() => false);
}

async function applyWaterReminders(enabled: boolean, hours: number[]) {
  if (Platform.OS === 'web') return !enabled;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return true;

  const allowed = await requestReminderPermission();
  if (!allowed) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Hydration reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  for (const hour of hours) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to drink water',
        body: 'A quick glass keeps your HabitFlow streak alive.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
        channelId: 'reminders',
      },
    });
  }

  return true;
}

function isAllowed(settings: Notifications.NotificationPermissionsStatus) {
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
