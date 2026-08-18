import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestReminderPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function syncWaterReminders(enabled: boolean, hours: number[]) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;

  const allowed = await requestReminderPermission();
  if (!allowed) return;

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
}
