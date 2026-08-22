// Trending 2026 palette: deep indigo/violet base with electric accent
// gradients for streaks (fire), hydration (water), and rewards (gem).
export const Gradients = {
  brand: ['#6D5DF6', '#A855F7'] as const,
  brandSoft: ['#8B7CFA', '#C084FC'] as const,
  fire: ['#FF6B4A', '#FFB454'] as const,
  water: ['#22D3EE', '#3B82F6'] as const,
  gem: ['#C084FC', '#F472B6'] as const,
  success: ['#22D3AA', '#34D399'] as const,
  heroLight: ['#F1EEFF', '#EAF4FF'] as const,
  heroDark: ['#1D1A38', '#141227'] as const,
};

const tintLight = '#6D5DF6';
const tintDark = '#9C8DFF';

export default {
  light: {
    text: '#181425',
    muted: '#726E8A',
    background: '#F7F6FC',
    backgroundAlt: '#EFEEFC',
    /** Recessed surfaces that sit *on* a card: progress tracks, empty dots. */
    track: '#EFEEFC',
    card: '#FFFFFF',
    cardAlt: '#F4F2FE',
    border: '#E9E6F7',
    shadow: 'rgba(109, 93, 246, 0.14)',
    tint: tintLight,
    onTint: '#FFFFFF',
    water: '#0EA5E9',
    streak: '#FF6B35',
    gem: '#A855F7',
    success: '#0E9F6E',
    successSoft: 'rgba(16, 185, 129, 0.14)',
    danger: '#DC2626',
    tabIconDefault: '#8A85A3',
    tabIconSelected: tintLight,
    tabBarBg: 'rgba(255,255,255,0.82)',
  },
  dark: {
    text: '#F3F1FF',
    muted: '#A29DC2',
    background: '#0A0916',
    backgroundAlt: '#100E20',
    // Lighter than `card` on purpose — on dark, a recessed surface has to sit
    // above the card it is drawn on or it reads as a hole punched in it.
    track: '#262146',
    card: '#181530',
    cardAlt: '#1F1B3B',
    border: '#2A2549',
    shadow: 'rgba(0, 0, 0, 0.45)',
    tint: tintDark,
    onTint: '#120E28',
    water: '#38BDF8',
    streak: '#FF9466',
    gem: '#C9A6FF',
    success: '#34D399',
    successSoft: 'rgba(52, 211, 153, 0.18)',
    danger: '#F87171',
    tabIconDefault: '#7B7599',
    tabIconSelected: tintDark,
    tabBarBg: 'rgba(19, 17, 38, 0.78)',
  },
};
