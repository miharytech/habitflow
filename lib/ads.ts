import type { ComponentType } from 'react';
import { NativeModules, Platform } from 'react-native';

import Constants from 'expo-constants';

type BannerSize = { ANCHORED_ADAPTIVE_BANNER: string };
type AdsSdk = {
  TestIds: { ADAPTIVE_BANNER: string; INTERSTITIAL: string; REWARDED: string };
  AdEventType: { LOADED: string; CLOSED: string; ERROR: string };
  RewardedAdEventType: { LOADED: string; EARNED_REWARD: string };
  BannerAdSize: BannerSize;
  BannerAd: ComponentType<{ unitId: string; size: string }>;
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

export async function showInterstitial() {
  const sdk = getSdk();
  if (!sdk) return false;
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
  if (!sdk) return false;
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
  if (!sdk) return null;
  const unitId = resolveUnitId(sdk, 'banner');
  if (!unitId) return null;
  return {
    BannerAd: sdk.BannerAd,
    BannerAdSize: sdk.BannerAdSize,
    unitId,
  };
}
