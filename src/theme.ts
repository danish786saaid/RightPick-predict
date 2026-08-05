import { Platform, useWindowDimensions, type TextStyle } from 'react-native';

/** Disable browser text selection (RN Web). */
export const noSelect: TextStyle =
  Platform.OS === 'web'
    ? ({
        userSelect: 'none',
        // Vendor prefixes for broader browser coverage.
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      } as TextStyle)
    : {};

export const colors = {
  bg: '#0B1220',
  bgSoft: '#0F172A',
  surface: '#1A2436',
  surfaceElevated: '#222E42',
  surfaceHighlight: '#283548',
  border: '#2F3B50',
  borderSoft: 'rgba(148, 163, 184, 0.18)',
  text: '#F8FAFC',
  muted: '#94A3B8',
  mutedSoft: '#64748B',
  yes: '#10B981',
  yesDim: 'rgba(16, 185, 129, 0.14)',
  yesBorder: 'rgba(16, 185, 129, 0.42)',
  no: '#EF4444',
  noDim: 'rgba(239, 68, 68, 0.14)',
  noBorder: 'rgba(239, 68, 68, 0.42)',
  brand: '#F59E0B',
  brandDim: 'rgba(245, 158, 11, 0.14)',
  brandBorder: 'rgba(245, 158, 11, 0.42)',
  brandGlow: 'rgba(245, 158, 11, 0.28)',
  white: '#FFFFFF',
  overlay: 'rgba(2, 6, 23, 0.72)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  huge: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  full: 999,
} as const;

export const typography = {
  hero: { fontSize: 28, lineHeight: 36, fontWeight: '800' as const },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  meta: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
};

/** Responsive wide/airy layout — ~5.5% side gutters, expansive content. */
export function useContentLayout() {
  const { width, height } = useWindowDimensions();
  const maxContent = 1000;
  const contentWidth = Math.min(width, maxContent);
  const pad = Math.round(Math.max(22, contentWidth * 0.055));
  const innerWidth = contentWidth - pad * 2;
  const isWide = width >= 860;
  const isCompact = width < 520;
  const columns = isWide ? 2 : 1;
  const cardGap = isWide ? 20 : 16;
  const cardWidth =
    columns === 2 ? (innerWidth - cardGap) / 2 : innerWidth;

  return {
    width,
    height,
    contentWidth,
    pad,
    innerWidth,
    isWide,
    isCompact,
    columns,
    cardGap,
    cardWidth,
  };
}
