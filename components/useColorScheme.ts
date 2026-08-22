import { useColorScheme as useColorSchemeCore } from 'react-native';

import { useThemePreference } from '@/context/ThemeContext';

/**
 * The saved preference wins over the device in both directions, so a light
 * theme stays light on a phone in dark mode (and the other way round).
 */
export const useColorScheme = (): 'light' | 'dark' => {
  const coreScheme = useColorSchemeCore();
  const preference = useThemePreference();
  if (preference === 'light' || preference === 'dark') return preference;
  return coreScheme === 'dark' ? 'dark' : 'light';
};
