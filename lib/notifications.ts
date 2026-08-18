import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

import { STREAK_RISK_HOUR } from '@/lib/types';

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

const WATER_ID_PREFIX = 'habitflow.water.';
const STREAK_RISK_ID = 'habitflow.streak-risk';

let syncChain: Promise<void> = Promise.resolve();

export async function requestReminderPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (isAllowed(current)) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return isAllowed(asked);
}

export function syncWaterReminders(enabled: boolean, hours: number[]): Promise<boolean> {
  return syncReminderPlan({
    waterEnabled: enabled,
    waterHours: hours,
    streakAtRisk: false,
    streakCount: 0,
  }).then((result) => result.waterScheduled);
}

export function syncReminderPlan(plan: {
  waterEnabled: boolean;
  waterHours: number[];
  streakAtRisk: boolean;
  streakCount: number;
}): Promise<{ waterScheduled: boolean }> {
  const task = syncChain.then(() => applyReminderPlan(plan));
  syncChain = task.then(
    () => undefined,
    () => undefined
  );
  return task.catch(() => ({ waterScheduled: false }));
}

async function applyReminderPlan(plan: {
  waterEnabled: boolean;
  waterHours: number[];
  streakAtRisk: boolean;
  streakCount: number;
}) {
  if (Platform.OS === 'web') return { waterScheduled: !plan.waterEnabled };

  await cancelManagedNotifications();

  const needsPermission = plan.waterEnabled || plan.streakAtRisk;
  if (!needsPermission) return { waterScheduled: true };

  const allowed = await requestReminderPermission();
  if (!allowed) return { waterScheduled: false };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'HabitFlow reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  if (plan.waterEnabled) {
    for (const hour of plan.waterHours) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${WATER_ID_PREFIX}${hour}`,
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

  if (plan.streakAtRisk) {
    const fireAt = nextStreakRiskDate();
    if (fireAt) {
      const days = plan.streakCount;
      await Notifications.scheduleNotificationAsync({
        identifier: STREAK_RISK_ID,
        content: {
          title: days > 0 ? `Your ${days}-day streak is at risk` : 'Your streak is at risk',
          body: 'Finish today’s daily goal to keep the flame going.',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
          channelId: 'reminders',
        },
      });
    }
  }

  return { waterScheduled: true };
}

function nextStreakRiskDate(from = new Date()) {
  const target = new Date(from.getFullYear(), from.getMonth(), from.getDate(), STREAK_RISK_HOUR, 0, 0);
  if (target.getTime() <= from.getTime()) return null;
  return target;
}

async function cancelManagedNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(
        (item) => item.identifier === STREAK_RISK_ID || item.identifier.startsWith(WATER_ID_PREFIX)
      )
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

function isAllowed(settings: Notifications.NotificationPermissionsStatus) {
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
