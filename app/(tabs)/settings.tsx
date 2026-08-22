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
import { useI18n } from '@/context/I18nContext';
import { privacyOptionsRequired, showPrivacyOptions, subscribeToAdsReady } from '@/lib/ads';
import { LANGUAGE_CODES, LANGUAGE_NAMES, resolveLanguage, type LanguagePreference } from '@/lib/i18n';
import type { DailyGoalCount, ThemePreference } from '@/lib/types';

const GOALS = [1500, 2000, 2500, 3000];

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
    setThemePreference,
    setLanguage,
    resetAllData,
  } = useApp();
  const { t, language } = useI18n();

  const themes: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: t.settings.themeSystem },
    { value: 'light', label: t.settings.themeLight },
    { value: 'dark', label: t.settings.themeDark },
  ];
  const languages: { value: LanguagePreference; label: string }[] = [
    { value: 'system', label: t.settings.languageSystemChip },
    ...LANGUAGE_CODES.map((code) => ({ value: code as LanguagePreference, label: LANGUAGE_NAMES[code] })),
  ];
  const dailyGoals: { value: DailyGoalCount; label: string }[] = [
    { value: 1, label: t.settings.goalCasual },
    { value: 2, label: t.settings.goalRegular },
    { value: 3, label: t.settings.goalSerious },
    { value: 'all', label: t.settings.goalEverything },
  ];

  const schemeName = scheme === 'dark' ? t.settings.schemeDark : t.settings.schemeLight;

  const [adPrivacy, setAdPrivacy] = useState(false);
  useEffect(() => {
    const sync = () => setAdPrivacy(privacyOptionsRequired());
    sync();
    return subscribeToAdsReady(sync);
  }, []);

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text>{t.common.loading}</Text>
      </View>
    );
  }

  const confirmReset = () => {
    Alert.alert(t.settings.eraseTitle, t.settings.eraseBody, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.erase, style: 'destructive', onPress: () => void resetAllData() },
    ]);
  };

  const goalHelp =
    state.waterTrackingEnabled && state.includeWaterInDailyGoal
      ? t.settings.dailyGoalHelpWater
      : t.settings.dailyGoalHelp;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: clearance + 20 }]}
      showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>{t.settings.title}</Text>

      <Text style={[styles.label, { color: theme.text }]}>{t.settings.appearance}</Text>
      <Text style={[styles.help, { color: theme.muted }]}>
        {state.themePreference === 'system'
          ? t.settings.appearanceSystem(schemeName)
          : t.settings.appearanceFixed(schemeName)}
      </Text>
      <View style={styles.row}>
        {themes.map((item) => {
          const active = state.themePreference === item.value;
          return (
            <PressableScale
              key={item.value}
              onPress={() => setThemePreference(item.value)}
              scaleTo={0.94}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t.settings.themeA11y(item.label)}>
              {active ? (
                <LinearGradient colors={Gradients.brand} style={styles.chip}>
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

      <Text style={[styles.label, { color: theme.text }]}>{t.settings.language}</Text>
      <Text style={[styles.help, { color: theme.muted }]}>
        {state.language === 'system'
          ? t.settings.languageSystem(LANGUAGE_NAMES[language])
          : t.settings.languageFixed(LANGUAGE_NAMES[resolveLanguage(state.language)])}
      </Text>
      <View style={styles.row}>
        {languages.map((item) => {
          const active = state.language === item.value;
          return (
            <PressableScale
              key={item.value}
              onPress={() => setLanguage(item.value)}
              scaleTo={0.94}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t.settings.languageA11y(item.label)}>
              {active ? (
                <LinearGradient colors={Gradients.brandSoft} style={styles.chip}>
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

      <Text style={[styles.label, { color: theme.text }]}>{t.settings.dailyGoal}</Text>
      <Text style={[styles.help, { color: theme.muted }]}>{goalHelp}</Text>
      <View style={styles.row}>
        {dailyGoals.map((item) => {
          const active = state.dailyGoalCount === item.value;
          return (
            <PressableScale
              key={String(item.value)}
              onPress={() => setDailyGoalCount(item.value)}
              scaleTo={0.94}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t.settings.goalA11y(item.label)}>
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
                  {t.settings.waterIsATask}
                </Text>
                <Text style={[styles.switchHelp, { color: theme.muted }]}>
                  {t.settings.waterIsATaskHelp}
                </Text>
              </View>
              <Switch
                value={state.includeWaterInDailyGoal}
                onValueChange={setIncludeWaterInDailyGoal}
                accessibilityLabel={t.settings.waterIsATask}
                trackColor={{ true: theme.tint, false: theme.border }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>{t.settings.waterGoal}</Text>
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
                  accessibilityLabel={t.settings.waterGoalA11y(t.formatMl(ml))}>
                  {active ? (
                    <LinearGradient colors={Gradients.water} style={styles.chip}>
                      <Text style={styles.chipTextActive}>{t.formatMl(ml)}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.chip,
                        { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
                      ]}>
                      <Text style={[styles.chipText, { color: theme.text }]}>{t.formatMl(ml)}</Text>
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
                <Text style={[styles.cardTitle, { color: theme.text }]}>{t.settings.reminders}</Text>
                <Text style={[styles.switchHelp, { color: theme.muted }]}>
                  {state.reminderHours.map((hour) => `${hour}:00`).join(' · ')}
                </Text>
              </View>
              <Switch
                value={state.remindersEnabled}
                onValueChange={setRemindersEnabled}
                accessibilityLabel={t.settings.reminders}
                trackColor={{ true: theme.tint, false: theme.border }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </>
      ) : (
        <Text style={[styles.help, { color: theme.muted }]}>{t.settings.waterOff}</Text>
      )}

      <Text style={[styles.label, { color: theme.text }]}>{t.settings.privacy}</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
        ]}>
        <Text style={[styles.body, { color: theme.muted, marginTop: 0 }]}>
          {t.settings.privacyBody}
        </Text>
        {PRIVACY_POLICY_URL ? (
          <Row
            theme={theme}
            label={t.settings.privacyPolicy}
            onPress={() => {
              void WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
            }}
          />
        ) : null}
        {adPrivacy ? (
          <Row
            theme={theme}
            label={t.settings.adPrivacy}
            onPress={() => {
              void showPrivacyOptions();
            }}
          />
        ) : null}
        <Row theme={theme} label={t.settings.eraseData} danger onPress={confirmReset} />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow },
        ]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t.settings.about}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{t.settings.version(APP_VERSION)}</Text>
        {SUPPORT_EMAIL ? (
          <Row
            theme={theme}
            label={t.settings.contactSupport}
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
