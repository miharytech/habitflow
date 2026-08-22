import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useT } from '@/context/I18nContext';
import { TAB_BAR_HEIGHT, useTabBarSpace } from '@/components/useTabBarSpace';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { bottom } = useTabBarSpace();
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarShowLabel: true,
        // Without an explicit lineHeight the label box collapses to ~8px inside a
        // fixed-height tab bar and clips the glyphs.
        tabBarLabelStyle: { fontFamily: Fonts.semibold, fontSize: 11, lineHeight: 14 },
        tabBarIconStyle: { marginTop: 2 },
        tabBarStyle: [
          styles.tabBar,
          { borderColor: theme.border, shadowColor: theme.shadow, bottom },
        ],
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'ios' ? 60 : 100}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={[StyleSheet.absoluteFill, styles.blur, { backgroundColor: theme.tabBarBg }]}
          />
        ),
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { fontFamily: Fonts.extrabold, fontSize: 20, color: theme.text },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.today,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: t.tabs.habits,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t.tabs.progress,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'chart.line.uptrend.xyaxis', android: 'insights', web: 'insights' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: TAB_BAR_HEIGHT,
    borderRadius: 28,
    borderWidth: 1,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
    elevation: 0,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  blur: {
    borderRadius: 28,
    overflow: 'hidden',
  },
});
