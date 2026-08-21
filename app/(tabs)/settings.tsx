import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch } from 'react-native';

import PressableScale from '@/components/PressableScale';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useTabBarSpace } from '@/components/useTabBarSpace';
import Colors, { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { APP_VERSION, PRIVACY_POLICY_URL, SUPPORT_EMAIL } from '@/constants/Links';
import { useApp } from '@/context/AppProvider';
import { privacyOptionsRequired, showPrivacyOptions, subscribeToAdsReady } from '@/lib/ads';
import { formatMl } from '@/lib/dates';
import type { DailyGoalCount } from '@/lib/types';

const GOALS = [1500, 2000, 2500, 3000];
const DAILY_GOALS: { value: DailyGoalCount; label: string }[] = [
  { value: 1, label: 'Casual · 1' },
  { value: 2, label: 'Regular · 2' },
  { value: 3, label: 'Serious · 3' },
  { value: 'all', label: 'Everything' },
];

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { clearance } = useTabBarSpace();
  const {
    ready,
    state,
    setWaterGoal,
    setRemindersEnabled,
    setDailyGoalCount,
    setIncludeWaterInDailyGoal,
    resetAllData,
  } = useApp();

  const [adPrivacy, setAdPrivacy] = useState(false);
  useEffect(() => {
    const sync = () => setAdPrivacy(privacyOptionsRequired());
    sync();
    return subscribeToAdsReady(sync);
  }, []);

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text>Loading…</Text>
      </View>
    );
  }

  const confirmReset = () => {
    Alert.alert(
      'Erase all HabitFlow data?',
      'Your habits, sip history, streak, XP and gems are stored only on this phone. They will be permanently deleted and HabitFlow will start over from scratch.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase', style: 'destructive', onPress: () => void resetAllData() },
      ]
    );
  };

  const goalHelp =
    state.waterTrackingEnabled && state.includeWaterInDailyGoal
      ? 'Finish this many tasks to keep your flame. Your water goal counts as one of them.'
      : 'Finish this many habits to keep your flame. If you have fewer habits, the goal shrinks to match.';

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: clearance + 20 }]}
      showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <Text style={[styles.label, { color: theme.text }]}>Daily goal</Text>
      <Text style={[styles.help, { color: theme.muted }]}>{goalHelp}</Text>
      <View style={styles.row}>
        {DAILY_GOALS.map((item) => {
          const active = state.dailyGoalCount === item.value;
          return (
            <PressableScale
              key={String(item.value)}
              onPress={() => setDailyGoalCount(item.value)}
              scaleTo={0.94}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Daily goal: ${item.label}`}>
              {active ? (
                <LinearGradient colors={Gradients.fire} style={styles.chip}>
                  <Text style={styles.chipTextActive}>{item.label}</Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
                  ]}>
                  <Text style={[styles.chipText, { color: theme.text }]}>{item.label}</Text>
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>

      {state.waterTrackingEnabled ? (
        <>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
            ]}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Water counts as a daily task
                </Text>
                <Text style={[styles.switchHelp, { color: theme.muted }]}>
                  On: hitting your water goal ticks off one of your daily tasks. Off: water only
                  earns bonus XP.
                </Text>
              </View>
              <Switch
                value={state.includeWaterInDailyGoal}
                onValueChange={setIncludeWaterInDailyGoal}
                accessibilityLabel="Water counts as a daily task"
                trackColor={{ true: theme.tint, false: theme.border }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Daily water goal</Text>
          <View style={styles.row}>
            {GOALS.map((ml) => {
              const active = state.waterGoalMl === ml;
              return (
                <PressableScale
                  key={ml}
                  onPress={() => setWaterGoal(ml)}
                  scaleTo={0.94}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Water goal ${formatMl(ml)}`}>
                  {active ? (
                    <LinearGradient colors={Gradients.water} style={styles.chip}>
                      <Text style={styles.chipTextActive}>{formatMl(ml)}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.chip,
                        { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
                      ]}>
                      <Text style={[styles.chipText, { color: theme.text }]}>{formatMl(ml)}</Text>
                    </View>
                  )}
                </PressableScale>
              );
            })}
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
            ]}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Water reminders</Text>
                <Text style={[styles.switchHelp, { color: theme.muted }]}>
                  {state.reminderHours.map((hour) => `${hour}:00`).join(' · ')}
                </Text>
              </View>
              <Switch
                value={state.remindersEnabled}
                onValueChange={setRemindersEnabled}
                accessibilityLabel="Water reminders"
                trackColor={{ true: theme.tint, false: theme.border }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </>
      ) : (
        <Text style={[styles.help, { color: theme.muted }]}>
          Water tracking is off. Add it back from the Habits tab.
        </Text>
      )}

      <Text style={[styles.label, { color: theme.text }]}>Privacy</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
        ]}>
        <Text style={[styles.body, { color: theme.muted, marginTop: 0 }]}>
          HabitFlow keeps your habits, sips and streak on this device only. Nothing is uploaded to a
          server. Ads are served by Google AdMob.
        </Text>
        {PRIVACY_POLICY_URL ? (
          <Row
            theme={theme}
            label="Privacy policy"
            onPress={() => {
              void WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
            }}
          />
        ) : null}
        {adPrivacy ? (
          <Row
            theme={theme}
            label="Ad privacy options"
            onPress={() => {
              void showPrivacyOptions();
            }}
          />
        ) : null}
        <Row theme={theme} label="Erase all my data" danger onPress={confirmReset} />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
        ]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>About</Text>
        <Text style={[styles.body, { color: theme.muted }]}>HabitFlow {APP_VERSION}</Text>
        {SUPPORT_EMAIL ? (
          <Row
            theme={theme}
            label="Contact support"
            onPress={() => {
              void Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
            }}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

function Row({
  theme,
  label,
  onPress,
  danger,
}: {
  theme: (typeof Colors)['light'];
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.linkRow, { borderTopColor: theme.border }]}>
      <Text
        style={[styles.linkText, { color: danger ? theme.danger : theme.tint }]}>
        {label}
      </Text>
      <Text style={[styles.linkChevron, { color: danger ? theme.danger : theme.tint }]}>›</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 28, fontFamily: Fonts.extrabold, marginBottom: 8 },
  label: { fontSize: 16, fontFamily: Fonts.bold, marginTop: 8 },
  help: { fontSize: 13, lineHeight: 18, marginTop: -4, fontFamily: Fonts.medium },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'transparent' },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  chipText: { fontFamily: Fonts.bold, fontSize: 13 },
  chipTextActive: { fontFamily: Fonts.bold, fontSize: 13, color: '#fff' },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  switchHelp: { marginTop: 4, fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18 },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bold },
  body: { marginTop: 8, lineHeight: 20, fontFamily: Fonts.medium, fontSize: 13 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
    backgroundColor: 'transparent',
  },
  linkText: { fontFamily: Fonts.bold, fontSize: 14 },
  linkChevron: { fontFamily: Fonts.extrabold, fontSize: 18 },
});
