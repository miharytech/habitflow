import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { Text } from '@/components/Themed';
import { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { formatMl } from '@/lib/dates';

type Props = {
  ml: number;
  goalMl: number;
  size?: number;
  trackColor: string;
  textColor: string;
  mutedColor: string;
};

export default function WaterRing({
  ml,
  goalMl,
  size = 220,
  trackColor,
  textColor,
  mutedColor,
}: Props) {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(ml / Math.max(goalMl, 1), 1);
  const offset = circumference * (1 - progress);
  const percent = Math.round(progress * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Water: ${formatMl(ml)} of ${formatMl(goalMl)}, ${percent} percent`}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* The whole canvas is rotated so the arc starts at 12 o'clock. Rotating
          the <Circle> instead needs `rotation`/`origin`, which react-native-svg
          forwards to the DOM as an invalid `transform-origin` on web. */}
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgLinearGradient id="waterGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Gradients.water[0]} />
            <Stop offset="1" stopColor={Gradients.water[1]} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#waterGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </Svg>
      <Text style={{ fontSize: 21 }} accessibilityElementsHidden importantForAccessibility="no">
        💧
      </Text>
      <Text style={{ fontSize: 38, fontFamily: Fonts.extrabold, color: textColor, marginTop: 2 }}>
        {formatMl(ml)}
      </Text>
      <Text style={{ marginTop: 4, color: mutedColor, fontFamily: Fonts.semibold, fontSize: 13 }}>
        of {formatMl(goalMl)} · {percent}%
      </Text>
    </View>
  );
}
