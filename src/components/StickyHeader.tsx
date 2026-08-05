import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, useContentLayout } from '../theme';
import { formatPts, USER } from '../data';

type Props = {
  points: number;
  onBalancePress: () => void;
  onStandingPress: () => void;
};

export function StickyHeader({
  points,
  onBalancePress,
  onStandingPress,
}: Props) {
  const { pad, isWide } = useContentLayout();

  return (
    <View style={[styles.wrap, { paddingHorizontal: pad }]}>
      <View style={[styles.row, isWide && styles.rowWide]}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{USER.avatarEmoji}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.brand}>RightPick</Text>
            <Text style={styles.username}>{USER.username}</Text>
            <Text style={styles.subtitle}>Hong Kong Crowd Forecast</Text>
          </View>
        </View>

        <View style={[styles.status, isWide && styles.statusWide]}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onBalancePress}
            accessibilityRole="button"
            accessibilityLabel="Open My Bets"
            style={styles.pointsPill}
          >
            <Text style={styles.pointsLabel}>BALANCE</Text>
            <View style={styles.pointsValueRow}>
              <Text style={styles.pointsText}>{formatPts(points)}</Text>
              <Text style={styles.pointsUnit}>PTS</Text>
              <Text style={styles.coin}>🪙</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onStandingPress}
            accessibilityRole="button"
            accessibilityLabel="Open Leaderboard"
            style={styles.rankPill}
          >
            <Text style={styles.rankLabel}>STANDING</Text>
            <Text style={styles.rankText}>
              🏆 #{USER.rank} · {USER.accuracy}% Acc
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  row: {
    gap: spacing.lg,
  },
  rowWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexShrink: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarEmoji: {
    fontSize: 26,
  },
  profileText: {
    flexShrink: 1,
    gap: 2,
  },
  brand: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  username: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 1,
  },
  status: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusWide: {
    flexShrink: 0,
  },
  pointsPill: {
    backgroundColor: colors.brandDim,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.lg,
    minWidth: 140,
  },
  pointsLabel: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  pointsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsText: {
    color: colors.brand,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.2,
  },
  pointsUnit: {
    color: colors.brand,
    fontWeight: '700',
    fontSize: 12,
    opacity: 0.85,
  },
  coin: {
    fontSize: 14,
  },
  rankPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.lg,
    minWidth: 140,
  },
  rankLabel: {
    color: colors.mutedSoft,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  rankText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
