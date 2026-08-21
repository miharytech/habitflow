import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 74;
const MIN_GAP = 16;

/**
 * The floating tab bar is absolutely positioned, so it does not reserve any
 * layout space. Screens use `clearance` as their bottom padding to keep the
 * last row of content — and the ad banner — above it on every device, gesture
 * navigation and home indicators included.
 */
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, MIN_GAP);
  return { bottom, clearance: bottom + TAB_BAR_HEIGHT + 12 };
}
