import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/Themed';
import { formatMl } from '@/lib/dates';

type Props = {
  ml: number;
  goalMl: number;
  size?: number;
  trackColor: string;
  progressColor: string;
  textColor: string;
  mutedColor: string;
};

export default function WaterRing({
  ml,
  goalMl,
  size = 220,
  trackColor,
  progressColor,
  textColor,
  mutedColor,
}: Props) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(ml / Math.max(goalMl, 1), 1);
  const offset = circumference * (1 - progress);
  const percent = Math.round(progress * 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
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
          stroke={progressColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontSize: 36, fontWeight: '800', color: textColor }}>{formatMl(ml)}</Text>
      <Text style={{ marginTop: 4, color: mutedColor }}>of {formatMl(goalMl)} · {percent}%</Text>
    </View>
  );
}
