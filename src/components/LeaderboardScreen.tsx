import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LEADERS, formatPts, USER } from '../data';
import {
  colors,
  noSelect,
  radius,
  spacing,
  useContentLayout,
} from '../theme';

const PODIUM_COLORS = ['#F59E0B', '#94A3B8', '#B45309'] as const;

export function LeaderboardScreen() {
  const { pad, isWide } = useContentLayout();
  const podium = LEADERS.slice(0, 3);
  const rest = LEADERS.slice(3);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: pad, maxWidth: isWide ? 960 : undefined },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Local Accuracy Rankings</Text>
      <Text style={styles.sub}>
        Top Hong Kong predictors ranked by resolved-market accuracy.
      </Text>

      <View style={[styles.podium, isWide && styles.podiumWide]}>
        {podium.map((leader, index) => {
          const rank = index + 1;
          return (
            <View
              key={leader.id}
              style={[
                styles.podiumCard,
                rank === 1 && styles.podiumFirst,
                isWide && styles.podiumCardWide,
              ]}
            >
              <Text style={[styles.podiumRank, { color: PODIUM_COLORS[index] }]}>
                #{rank}
              </Text>
              <View style={styles.podiumAvatar}>
                <Text style={styles.podiumEmoji}>{leader.avatarEmoji}</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {leader.username}
              </Text>
              <View style={styles.podiumBadge}>
                <Text style={styles.podiumBadgeText}>{leader.badge}</Text>
              </View>
              <Text style={styles.podiumAcc}>{leader.accuracy}% Acc</Text>
              <Text style={styles.podiumPts}>
                {formatPts(leader.points)} PTS
              </Text>
            </View>
          );
        })}
      </View>

      {rest.map((leader) => {
        const isYou = leader.username === USER.username;
        const rank = leader.id === '14' ? 14 : LEADERS.findIndex((l) => l.id === leader.id) + 1;

        return (
          <View
            key={leader.id}
            style={[styles.row, isYou && styles.rowYou]}
          >
            <View style={styles.rankBox}>
              <Text style={styles.rank}>#{rank}</Text>
            </View>

            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{leader.avatarEmoji}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>
                {leader.username}
                {isYou ? ' (You)' : ''}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{leader.badge}</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <Text style={styles.acc}>{leader.accuracy}% Acc</Text>
              <Text style={styles.pts}>{formatPts(leader.points)} PTS</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
    alignSelf: 'center',
    width: '100%',
  },
  heading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
    ...noSelect,
  },
  sub: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
    ...noSelect,
  },
  podium: {
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  podiumWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  podiumCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  podiumCardWide: {
    minWidth: 0,
  },
  podiumFirst: {
    borderColor: colors.brandBorder,
    backgroundColor: colors.brandDim,
  },
  podiumRank: {
    fontSize: 18,
    fontWeight: '800',
    ...noSelect,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.brand,
  },
  podiumEmoji: {
    fontSize: 26,
  },
  podiumName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
    ...noSelect,
  },
  podiumBadge: {
    backgroundColor: colors.bgSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  podiumBadgeText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    ...noSelect,
  },
  podiumAcc: {
    color: colors.yes,
    fontWeight: '800',
    fontSize: 18,
    ...noSelect,
  },
  podiumPts: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    ...noSelect,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  rowYou: {
    borderColor: colors.brand,
    backgroundColor: colors.brandDim,
  },
  rankBox: {
    width: 44,
    alignItems: 'center',
  },
  rank: {
    color: colors.muted,
    fontWeight: '800',
    fontSize: 15,
    ...noSelect,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    ...noSelect,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    ...noSelect,
  },
  stats: {
    alignItems: 'flex-end',
    gap: 3,
  },
  acc: {
    color: colors.yes,
    fontWeight: '800',
    fontSize: 15,
    ...noSelect,
  },
  pts: {
    color: colors.muted,
    fontSize: 12,
    ...noSelect,
  },
});
