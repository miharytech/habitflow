export const isExpoGo = true;

export function isAdMobAvailable() {
  return false;
}

export function initializeAds() {
  return Promise.resolve(false);
}

export function canRequestAds() {
  return false;
}

export function privacyOptionsRequired() {
  return false;
}

export async function showPrivacyOptions() {
  return false;
}

export function subscribeToAdsReady(_listener: () => void) {
  return () => undefined;
}

export async function showInterstitial() {
  return false;
}

export async function showRewardedAd() {
  return false;
}

export function getBannerAd() {
  return null;
}
