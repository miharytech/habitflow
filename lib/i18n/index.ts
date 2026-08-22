import { en, type Messages } from '@/lib/i18n/en';
import { es } from '@/lib/i18n/es';
import { fr } from '@/lib/i18n/fr';
import { zh } from '@/lib/i18n/zh';

export type { Messages } from '@/lib/i18n/en';

/** English is the fallback for every device language that is not translated. */
export type LanguageCode = 'en' | 'fr' | 'zh' | 'es';
export type LanguagePreference = 'system' | LanguageCode;

export const MESSAGES: Record<LanguageCode, Messages> = { en, fr, zh, es };
export const LANGUAGE_CODES: LanguageCode[] = ['en', 'fr', 'zh', 'es'];
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && (LANGUAGE_CODES as string[]).includes(value);
}

/**
 * The device language, or English when it is one HabitFlow does not speak.
 * `expo-localization` reads this synchronously, but it is wrapped defensively:
 * a locale lookup must never be the reason the app fails to render.
 */
export function deviceLanguage(): LanguageCode {
  try {
    // Required lazily so a missing native module degrades to English instead of
    // taking the bundle down at import time.
    const { getLocales } = require('expo-localization') as typeof import('expo-localization');
    for (const locale of getLocales()) {
      const code = locale.languageCode?.toLowerCase();
      if (isLanguageCode(code)) return code;
    }
  } catch {
    // fall through
  }
  return DEFAULT_LANGUAGE;
}

export function resolveLanguage(preference: LanguagePreference): LanguageCode {
  return preference === 'system' ? deviceLanguage() : preference;
}

export function messagesFor(preference: LanguagePreference): Messages {
  return MESSAGES[resolveLanguage(preference)];
}

/** Display names are always written in their own language, never translated. */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: en.name,
  fr: fr.name,
  zh: zh.name,
  es: es.name,
};
