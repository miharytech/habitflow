import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getBannerAd, isAdMobAvailable, isExpoGo } from '@/lib/ads';

export default function AdBanner() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
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
    <View style={[styles.placeholder, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
      <Text style={[styles.placeholderText, { color: theme.muted }]}>
        {isExpoGo || !isAdMobAvailable()
          ? 'Ads show in a Play Store / development build'
          : 'Add AdMob unit IDs to show ads'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 100,
  },
  placeholder: {
    marginHorizontal: 16,
    marginBottom: 100,
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
