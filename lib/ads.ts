import type { ComponentType } from 'react';
import { NativeModules, Platform } from 'react-native';

import Constants from 'expo-constants';

type BannerSize = { ANCHORED_ADAPTIVE_BANNER: string };
type ConsentInfo = {
  status: string;
  canRequestAds: boolean;
  privacyOptionsRequirementStatus: string;
  isConsentFormAvailable: boolean;
};
type AdsSdk = {
  TestIds: { ADAPTIVE_BANNER: string; INTERSTITIAL: string; REWARDED: string };
  AdEventType: { LOADED: string; CLOSED: string; ERROR: string };
  RewardedAdEventType: { LOADED: string; EARNED_REWARD: string };
  BannerAdSize: BannerSize;
  BannerAd: ComponentType<{ unitId: string; size: string }>;
  MaxAdContentRating: { G: string };
  AdsConsentPrivacyOptionsRequirementStatus: { REQUIRED: string };
  AdsConsent: {
    gatherConsent: () => Promise<ConsentInfo>;
    getConsentInfo: () => Promise<ConsentInfo>;
    showPrivacyOptionsForm: () => Promise<ConsentInfo>;
  };
  default: () => {
    initialize: () => Promise<unknown>;
    setRequestConfiguration: (config: {
      maxAdContentRating?: string;
      tagForChildDirectedTreatment?: boolean;
      tagForUnderAgeOfConsent?: boolean;
    }) => Promise<void>;
  };
  InterstitialAd: {
    createForAdRequest: (unitId: string, options?: { keywords?: string[] }) => AdInstance;
  };
  RewardedAd: {
    createForAdRequest: (unitId: string, options?: { keywords?: string[] }) => AdInstance;
  };
};

type AdInstance = {
  load: () => void;
  show: () => Promise<void>;
  addAdEventListener: (event: string, cb: (payload?: unknown) => void) => () => void;
};

type AdKind = 'banner' | 'interstitial' | 'rewarded';

const AD_KEYWORDS = ['health', 'fitness', 'hydration', 'habits', 'wellness'];
const AD_LOAD_TIMEOUT_MS = 15_000;
const GOOGLE_TEST_PUBLISHER = 'ca-app-pub-3940256099942544';

export const isExpoGo = Constants.appOwnership === 'expo';

export function isAdMobAvailable() {
  if (Platform.OS === 'web') return false;
  return Boolean((NativeModules as { RNGoogleMobileAdsModule?: unknown }).RNGoogleMobileAdsModule);
}

function getSdk(): AdsSdk | null {
  if (!isAdMobAvailable()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-google-mobile-ads') as AdsSdk;
}

function isGoogleTestId(id: string) {
  return id.includes(GOOGLE_TEST_PUBLISHER);
}

function configuredUnitId(kind: AdKind) {
  const extra = Constants.expoConfig?.extra as { ads?: Record<string, string> } | undefined;
  const key = `${kind}UnitId`;
  return extra?.ads?.[key]?.trim() ?? '';
}

function resolveUnitId(sdk: AdsSdk, kind: AdKind) {
  const configured = configuredUnitId(kind);
  if (configured && !isGoogleTestId(configured)) return configured;
  if (__DEV__) {
    if (kind === 'banner') return sdk.TestIds.ADAPTIVE_BANNER;
    if (kind === 'interstitial') return sdk.TestIds.INTERSTITIAL;
    return sdk.TestIds.REWARDED;
  }
  return null;
}

let initialization: Promise<boolean> | null = null;
let consent: ConsentInfo | null = null;
const readyListeners = new Set<() => void>();

function notifyReady() {
  for (const listener of [...readyListeners]) listener();
}

export function subscribeToAdsReady(listener: () => void) {
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}

/**
 * True once the Google Mobile Ads SDK is initialized and the user's consent
 * choice allows an ad request. Until then nothing may be loaded — requesting
 * ads before the UMP form is answered violates AdMob's EEA consent policy.
 */
export function canRequestAds() {
  return consent?.canRequestAds === true;
}

/** The user is in a region where a "Privacy options" entry point is mandatory. */
export function privacyOptionsRequired() {
  const sdk = getSdk();
  if (!sdk || !consent) return false;
  return (
    consent.privacyOptionsRequirementStatus ===
    sdk.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
  );
}

export async function showPrivacyOptions() {
  const sdk = getSdk();
  if (!sdk) return false;
  try {
    consent = await sdk.AdsConsent.showPrivacyOptionsForm();
    notifyReady();
    return true;
  } catch {
    return false;
  }
}

/**
 * Gathers consent, applies the app-wide request configuration, then starts the
 * SDK. Safe to call repeatedly: it succeeds once and is then a no-op, but a
 * failed attempt (usually a consent form that could not be fetched offline) is
 * discarded so the next call can retry rather than leaving ads off for the rest
 * of the session.
 */
export function initializeAds() {
  if (!initialization) {
    initialization = runInitialization().then((ok) => {
      if (!ok) initialization = null;
      return ok;
    });
  }
  return initialization;
}

async function runInitialization() {
  const sdk = getSdk();
  if (!sdk) return false;

  try {
    // Presents the Google-hosted consent form when the user's region needs one.
    consent = await sdk.AdsConsent.gatherConsent();
  } catch {
    // A consent failure must not take ads down outside the EEA, where the form
    // is not required; fall back to whatever status the SDK already holds.
    try {
      consent = await sdk.AdsConsent.getConsentInfo();
    } catch {
      consent = null;
    }
  }

  try {
    const mobileAds = sdk.default();
    // HabitFlow is a general wellness app, so keep ad content family-safe.
    await mobileAds.setRequestConfiguration({
      maxAdContentRating: sdk.MaxAdContentRating.G,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds.initialize();
  } catch {
    return false;
  }

  notifyReady();
  return canRequestAds();
}

export async function showInterstitial() {
  const sdk = getSdk();
  if (!sdk || !canRequestAds()) return false;
  const unitId = resolveUnitId(sdk, 'interstitial');
  if (!unitId) return false;

  const ad = sdk.InterstitialAd.createForAdRequest(unitId, { keywords: AD_KEYWORDS });

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      loaded();
      closed();
      error();
      resolve(value);
    };
    const loaded = ad.addAdEventListener(sdk.AdEventType.LOADED, () => {
      clearTimeout(timer);
      ad.show().then(() => finish(true)).catch(() => finish(false));
    });
    const closed = ad.addAdEventListener(sdk.AdEventType.CLOSED, () => {
      loaded();
      closed();
      error();
    });
    const error = ad.addAdEventListener(sdk.AdEventType.ERROR, () => finish(false));
    const timer = setTimeout(() => finish(false), AD_LOAD_TIMEOUT_MS);
    ad.load();
  });
}

export async function showRewardedAd() {
  const sdk = getSdk();
  if (!sdk || !canRequestAds()) return false;
  const unitId = resolveUnitId(sdk, 'rewarded');
  if (!unitId) return false;

  const ad = sdk.RewardedAd.createForAdRequest(unitId, { keywords: AD_KEYWORDS });

  return new Promise<boolean>((resolve) => {
    let earned = false;
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      loaded();
      reward();
      closed();
      error();
      resolve(value);
    };
    const loaded = ad.addAdEventListener(sdk.RewardedAdEventType.LOADED, () => {
      clearTimeout(timer);
      ad.show().catch(() => finish(false));
    });
    const reward = ad.addAdEventListener(sdk.RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });
    const closed = ad.addAdEventListener(sdk.AdEventType.CLOSED, () => finish(earned));
    const error = ad.addAdEventListener(sdk.AdEventType.ERROR, () => finish(false));
    const timer = setTimeout(() => finish(false), AD_LOAD_TIMEOUT_MS);
    ad.load();
  });
}

export function getBannerAd() {
  const sdk = getSdk();
  if (!sdk || !canRequestAds()) return null;
  const unitId = resolveUnitId(sdk, 'banner');
  if (!unitId) return null;
  return {
    BannerAd: sdk.BannerAd,
    BannerAdSize: sdk.BannerAdSize,
    unitId,
  };
}
