import { Platform } from 'react-native';

import type * as NotificationsModule from 'expo-notifications';

import { STREAK_RISK_HOUR } from '@/lib/types';

type Notifications = typeof NotificationsModule;

// expo-notifications throws while being imported in Expo Go on Android: its
// DevicePushTokenAutoRegistration side effect registers a push token listener at
// module scope, and remote push was removed from Expo Go in SDK 53. Only local
// notifications are used below and those still work, so resolve the module
// defensively and fall back to a no-op rather than taking the whole app down.
let cachedModule: Notifications | null | undefined;

function getNotifications(): Notifications | null {
  if (cachedModule !== undefined) return cachedModule;
  try {
    cachedModule = require('expo-notifications') as Notifications;
  } catch {
    cachedModule = null;
    console.warn(
      '[habitflow] expo-notifications is unavailable, reminders are disabled. Run a development build instead of Expo Go.'
    );
  }
  return cachedModule;
}

if (Platform.OS !== 'web') {
  getNotifications()?.setNotificationHandler({
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
  const notifications = getNotifications();
  if (!notifications) return false;

  const current = await notifications.getPermissionsAsync();
  if (isAllowed(notifications, current)) return true;
  const asked = await notifications.requestPermissionsAsync();
  return isAllowed(notifications, asked);
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

  const notifications = getNotifications();
  if (!notifications) return { waterScheduled: !plan.waterEnabled };

  await cancelManagedNotifications(notifications);

  const needsPermission = plan.waterEnabled || plan.streakAtRisk;
  if (!needsPermission) return { waterScheduled: true };

  const allowed = await requestReminderPermission();
  if (!allowed) return { waterScheduled: false };

  if (Platform.OS === 'android') {
    await notifications.setNotificationChannelAsync('reminders', {
      name: 'HabitFlow reminders',
      importance: notifications.AndroidImportance.DEFAULT,
    });
  }

  if (plan.waterEnabled) {
    for (const hour of plan.waterHours) {
      await notifications.scheduleNotificationAsync({
        identifier: `${WATER_ID_PREFIX}${hour}`,
        content: {
          title: 'Time to drink water',
          body: 'A quick glass keeps your HabitFlow streak alive.',
          sound: 'default',
        },
        trigger: {
          type: notifications.SchedulableTriggerInputTypes.DAILY,
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
      await notifications.scheduleNotificationAsync({
        identifier: STREAK_RISK_ID,
        content: {
          title: days > 0 ? `Your ${days}-day streak is at risk` : 'Your streak is at risk',
          body: 'Finish today’s daily goal to keep the flame going.',
          sound: 'default',
        },
        trigger: {
          type: notifications.SchedulableTriggerInputTypes.DATE,
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

async function cancelManagedNotifications(notifications: Notifications) {
  const scheduled = await notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(
        (item) => item.identifier === STREAK_RISK_ID || item.identifier.startsWith(WATER_ID_PREFIX)
      )
      .map((item) => notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

function isAllowed(
  notifications: Notifications,
  settings: NotificationsModule.NotificationPermissionsStatus
) {
  return (
    settings.granted ||
    settings.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
