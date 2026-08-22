import { useState } from 'react';
import { StyleSheet, View as RNView, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { View } from '@/components/Themed';
import { Gradients } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { formatMl } from '@/lib/dates';
import { tickIndexes, type WaterPoint } from '@/lib/waterStats';

type Props = {
  points: WaterPoint[];
  goalMl: number;
  /** Per-day average across the range, drawn as the second reference line. */
  averageMl: number;
  height?: number;
  lineColor: string;
  gridColor: string;
  labelColor: string;
  goalColor: string;
  accessibilityLabel: string;
};

const PAD_LEFT = 38;
const PAD_RIGHT = 10;
const PAD_TOP = 14;
const PAD_BOTTOM = 22;

export default function WaterChart({
  points,
  goalMl,
  averageMl,
  height = 190,
  lineColor,
  gridColor,
  labelColor,
  goalColor,
  accessibilityLabel,
}: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const plotW = Math.max(width - PAD_LEFT - PAD_RIGHT, 1);
  const plotH = Math.max(height - PAD_TOP - PAD_BOTTOM, 1);
  const maxMl = Math.max(goalMl, ...points.map((point) => point.ml), 1);
  // Headroom above the tallest value keeps the curve off the top edge.
  const scaleMax = maxMl * 1.15;

  const x = (index: number) =>
    PAD_LEFT + (points.length <= 1 ? plotW / 2 : (index / (points.length - 1)) * plotW);
  const y = (ml: number) => PAD_TOP + plotH - (ml / scaleMax) * plotH;

  const coords = points.map((point, index) => ({ x: x(index), y: y(point.ml), point }));
  const line = smoothPath(coords);
  const area = line ? `${line} L ${coords[coords.length - 1].x} ${PAD_TOP + plotH} L ${coords[0].x} ${PAD_TOP + plotH} Z` : '';
  const showDots = points.length <= 14;
  const ticks = tickIndexes(points.length);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      onLayout={onLayout}
      style={[styles.wrap, { height }]}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <SvgLinearGradient id="waterLine" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={Gradients.water[0]} />
              <Stop offset="1" stopColor={Gradients.water[1]} />
            </SvgLinearGradient>
            <SvgLinearGradient id="waterArea" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={Gradients.water[0]} stopOpacity="0.34" />
              <Stop offset="1" stopColor={Gradients.water[1]} stopOpacity="0.02" />
            </SvgLinearGradient>
          </Defs>

          {/* Baseline and top gridline: two lines are enough to read the scale. */}
          <Line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={width - PAD_RIGHT} y2={PAD_TOP + plotH} stroke={gridColor} strokeWidth={1} />
          <SvgText x={0} y={PAD_TOP + plotH + 4} fill={labelColor} fontSize={10} fontFamily={Fonts.semibold}>
            0
          </SvgText>

          {/* The goal is the line that matters, so it is the labelled one. */}
          <Line
            x1={PAD_LEFT}
            y1={y(goalMl)}
            x2={width - PAD_RIGHT}
            y2={y(goalMl)}
            stroke={goalColor}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <SvgText x={0} y={y(goalMl) + 3} fill={goalColor} fontSize={10} fontFamily={Fonts.bold}>
            {formatMl(goalMl)}
          </SvgText>

          {averageMl > 0 ? (
            <Line
              x1={PAD_LEFT}
              y1={y(averageMl)}
              x2={width - PAD_RIGHT}
              y2={y(averageMl)}
              stroke={labelColor}
              strokeWidth={1}
              strokeDasharray="2 6"
              opacity={0.55}
            />
          ) : null}

          {area ? <Path d={area} fill="url(#waterArea)" /> : null}
          {line ? (
            <Path d={line} stroke="url(#waterLine)" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}

          {coords.map((coord, index) => {
            const last = index === coords.length - 1;
            if (!showDots && !last) return null;
            return (
              <Circle
                key={coord.point.key}
                cx={coord.x}
                cy={coord.y}
                r={last ? 4.5 : 3}
                fill={coord.point.met ? Gradients.water[0] : lineColor}
                stroke={last ? Gradients.water[1] : 'none'}
                strokeWidth={last ? 2 : 0}
              />
            );
          })}

          {ticks.map((index) => {
            const coord = coords[index];
            if (!coord) return null;
            const anchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle';
            return (
              <SvgText
                key={`tick-${coord.point.key}`}
                x={coord.x}
                y={height - 6}
                fill={labelColor}
                fontSize={10}
                fontFamily={Fonts.semibold}
                textAnchor={anchor}>
                {coord.point.label}
              </SvgText>
            );
          })}
        </Svg>
      ) : (
        <RNView />
      )}
    </View>
  );
}

/**
 * Monotone cubic interpolation — a plain Catmull-Rom curve overshoots after a
 * spike and would dip the line below zero, which reads as "drank negative water".
 */
function smoothPath(coords: { x: number; y: number }[]) {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

  const slopes = monotoneSlopes(coords);
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const dx = (p1.x - p0.x) / 3;
    d += ` C ${p0.x + dx} ${p0.y + slopes[i] * dx} ${p1.x - dx} ${p1.y - slopes[i + 1] * dx} ${p1.x} ${p1.y}`;
  }
  return d;
}

function monotoneSlopes(coords: { x: number; y: number }[]) {
  const n = coords.length;
  const deltas: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const dx = coords[i + 1].x - coords[i].x || 1;
    deltas.push((coords[i + 1].y - coords[i].y) / dx);
  }

  const slopes = new Array<number>(n).fill(0);
  slopes[0] = deltas[0];
  slopes[n - 1] = deltas[n - 2];
  for (let i = 1; i < n - 1; i += 1) {
    if (deltas[i - 1] * deltas[i] <= 0) {
      slopes[i] = 0;
      continue;
    }
    slopes[i] = (deltas[i - 1] + deltas[i]) / 2;
    const limit = 3 * Math.min(Math.abs(deltas[i - 1]), Math.abs(deltas[i]));
    if (Math.abs(slopes[i]) > limit) slopes[i] = Math.sign(slopes[i]) * limit;
  }
  return slopes;
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: 'transparent' },
});
