import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getBannerAd, isAdMobAvailable, isExpoGo } from '@/lib/ads';

export default function AdBanner() {
  const ads = getBannerAd();

  if (ads) {
    const { BannerAd, BannerAdSize, unitId } = ads;
    return (
      <View style={styles.wrap}>
        <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
      </View>
    );
  }

  return (
    <View style={styles.placeholder} lightColor="#CCFBF1" darkColor="#115E59">
      <Text style={styles.placeholderText}>
        {isExpoGo || !isAdMobAvailable()
          ? 'Ads show in a Play Store / development build'
          : 'Ad loading'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  placeholder: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
