import { createContext, useContext, type ReactNode } from 'react';

import { DEFAULT_THEME_PREFERENCE, type ThemePreference } from '@/lib/types';

/**
 * Kept apart from `AppProvider` so `useColorScheme` can read the saved
 * preference without importing the whole app state — and so it still returns a
 * sane value in any tree rendered outside the provider (the splash screen, an
 * error boundary).
 */
const ThemePreferenceContext = createContext<ThemePreference>(DEFAULT_THEME_PREFERENCE);

export function ThemePreferenceProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: ReactNode;
}) {
  return (
    <ThemePreferenceContext.Provider value={preference}>{children}</ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
