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

const AD_KEYWORDS = ['health', 'fitness', 'hydration', 'habits', 'wellness'];

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

export async function showInterstitial() {
  const sdk = getSdk();
  if (!sdk) return false;

  const unitId = sdk.TestIds.INTERSTITIAL;
  const ad = sdk.InterstitialAd.createForAdRequest(unitId, { keywords: AD_KEYWORDS });

  return new Promise<boolean>((resolve) => {
    const loaded = ad.addAdEventListener(sdk.AdEventType.LOADED, () => {
      loaded();
      closed();
      error();
      ad.show().then(() => resolve(true)).catch(() => resolve(false));
    });
    const closed = ad.addAdEventListener(sdk.AdEventType.CLOSED, () => {
      loaded();
      closed();
      error();
    });
    const error = ad.addAdEventListener(sdk.AdEventType.ERROR, () => {
      loaded();
      closed();
      error();
      resolve(false);
    });
    ad.load();
  });
}

export async function showRewardedAd() {
  const sdk = getSdk();
  if (!sdk) return false;

  const unitId = sdk.TestIds.REWARDED;
  const ad = sdk.RewardedAd.createForAdRequest(unitId, { keywords: AD_KEYWORDS });

  return new Promise<boolean>((resolve) => {
    let earned = false;
    const loaded = ad.addAdEventListener(sdk.RewardedAdEventType.LOADED, () => {
      ad.show().catch(() => resolve(false));
    });
    const reward = ad.addAdEventListener(sdk.RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });
    const closed = ad.addAdEventListener(sdk.AdEventType.CLOSED, () => {
      loaded();
      reward();
      closed();
      error();
      resolve(earned);
    });
    const error = ad.addAdEventListener(sdk.AdEventType.ERROR, () => {
      loaded();
      reward();
      closed();
      error();
      resolve(false);
    });
    ad.load();
  });
}

export function getBannerAd() {
  const sdk = getSdk();
  if (!sdk) return null;
  return {
    BannerAd: sdk.BannerAd,
    BannerAdSize: sdk.BannerAdSize,
    unitId: sdk.TestIds.ADAPTIVE_BANNER,
  };
}
