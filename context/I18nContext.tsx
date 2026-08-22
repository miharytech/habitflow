import { createContext, useContext, useMemo, type ReactNode } from 'react';

import {
  DEFAULT_LANGUAGE,
  MESSAGES,
  messagesFor,
  resolveLanguage,
  type LanguageCode,
  type LanguagePreference,
  type Messages,
} from '@/lib/i18n';

type I18nValue = {
  t: Messages;
  language: LanguageCode;
};

/**
 * Split from `AppProvider` for the same reason as the theme context: any tree
 * rendered before the app state exists (splash, error boundary) still needs a
 * usable `t`, and screens should not have to reach into the whole state to
 * read a label.
 */
const I18nContext = createContext<I18nValue>({
  t: MESSAGES[DEFAULT_LANGUAGE],
  language: DEFAULT_LANGUAGE,
});

export function I18nProvider({
  preference,
  children,
}: {
  preference: LanguagePreference;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({ t: messagesFor(preference), language: resolveLanguage(preference) }),
    [preference]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** The message catalogue for the active language. */
export function useT(): Messages {
  return useContext(I18nContext).t;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
