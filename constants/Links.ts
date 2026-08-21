import Constants from 'expo-constants';

type LinkExtra = {
  privacyPolicyUrl?: string;
  supportEmail?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as LinkExtra;

/**
 * Google Play and AdMob both require a reachable privacy policy for an app that
 * serves ads. Set `expo.extra.privacyPolicyUrl` in app.json before submitting;
 * the Settings entry hides itself while it is unset rather than shipping a
 * dead link.
 */
export const PRIVACY_POLICY_URL = extra.privacyPolicyUrl?.trim() ?? '';
export const SUPPORT_EMAIL = extra.supportEmail?.trim() ?? '';

export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
