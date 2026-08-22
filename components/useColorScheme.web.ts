import { useColorScheme as useColorSchemeCore } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useThemePreference } from '@/context/ThemeContext';

/**
 * Same rule as native — the saved preference overrides the device — but the
 * server-rendered HTML has no device and no stored state, so it is always
 * light and swaps to the real scheme after mount. Rendering the real scheme
 * during SSR would mismatch on hydration.
 */
export function useColorScheme(): 'light' | 'dark' {
  const coreScheme = useColorSchemeCore();
  const preference = useThemePreference();
  const resolved =
    preference === 'light' || preference === 'dark'
      ? preference
      : coreScheme === 'dark'
        ? 'dark'
        : 'light';
  return useClientOnlyValue<'light', 'light' | 'dark'>('light', resolved);
}
