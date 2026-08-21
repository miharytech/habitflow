import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useTabBarSpace } from '@/components/useTabBarSpace';
import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getBannerAd, initializeAds, subscribeToAdsReady } from '@/lib/ads';

export default function AdBanner() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { clearance } = useTabBarSpace();

  // Consent is gathered asynchronously at launch, so re-check once the ads
  // layer reports it is allowed to request an ad. Kicking off initialization
  // here too retries an attempt that failed earlier (for example offline).
  const [, forceCheck] = useState(0);
  useEffect(() => {
    void initializeAds();
    return subscribeToAdsReady(() => forceCheck((n) => n + 1));
  }, []);

  const ads = getBannerAd();

  if (ads) {
    const { BannerAd, BannerAdSize, unitId } = ads;
    return (
      <View style={[styles.wrap, { marginBottom: clearance }]}>
        <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
      </View>
    );
  }

  // Never show scaffolding to real users: without an ad the screen simply ends,
  // and only a development build explains why.
  if (!__DEV__) return <View style={{ height: clearance }} />;

  return (
    <View
      style={[
        styles.placeholder,
        { backgroundColor: theme.cardAlt, borderColor: theme.border, marginBottom: clearance },
      ]}>
      <Text style={[styles.placeholderText, { color: theme.muted }]}>
        Ad slot · shows in a development or Play Store build
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  placeholder: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
});
