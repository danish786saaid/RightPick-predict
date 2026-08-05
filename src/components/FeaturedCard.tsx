import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Market, PredictionSide, UserPrediction } from '../types';
import { formatPts } from '../data';
import { colors, radius, spacing, useContentLayout } from '../theme';
import { ProbabilityBar } from './ProbabilityBar';
import { StakeBadge } from './StakeBadge';

type Props = {
  market: Market;
  onPredict: (side: PredictionSide) => void;
  userStake?: UserPrediction;
};

export function FeaturedCard({ market, onPredict, userStake }: Props) {
  const { pad, isWide } = useContentLayout();

  return (
    <View style={[styles.wrap, { paddingHorizontal: pad }]}>
      <LinearGradient
        colors={['#1C2A40', '#152033', '#1A2740', '#132038']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, isWide && styles.cardWide]}
      >
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeDot}>●</Text>
            <Text style={styles.badgeText}>FEATURED MARKET</Text>
          </View>
          <Text style={styles.live}>Live crowd sentiment</Text>
        </View>

        <Text style={[styles.title, isWide && styles.titleWide]}>
          {market.title}
        </Text>

        {userStake ? <StakeBadge prediction={userStake} /> : null}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Closes</Text>
            <Text style={styles.metaValue}>in {market.endsIn}</Text>
          </View>
          {isWide ? <View style={styles.metaDivider} /> : null}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Participants</Text>
            <Text style={styles.metaValue}>
              {formatPts(market.participants)}
            </Text>
          </View>
          {isWide ? <View style={styles.metaDivider} /> : null}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>PTS Staked</Text>
            <Text style={styles.metaValue}>
              {formatPts(market.ptsStaked)}
            </Text>
          </View>
        </View>

        <View style={styles.barWrap}>
          <ProbabilityBar yesPct={market.yesPct} height={16} large />
        </View>

        <View style={[styles.actions, isWide && styles.actionsWide]}>
          <Pressable
            onPress={() => onPredict('YES')}
            style={({ pressed }) => [
              styles.btn,
              styles.yesBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnEyebrow}>Bullish</Text>
            <Text style={styles.btnText}>
              Predict YES · {market.yesOdds}x
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onPredict('NO')}
            style={({ pressed }) => [
              styles.btn,
              styles.noBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnEyebrow}>Bearish</Text>
            <Text style={styles.btnText}>
              Predict NO · {market.noOdds}x
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xxl,
  },
  card: {
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    shadowColor: colors.brand,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    gap: spacing.xl,
  },
  cardWide: {
    padding: spacing.huge,
    gap: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brandDim,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.brandBorder,
  },
  badgeDot: {
    color: colors.brand,
    fontSize: 8,
  },
  badgeText: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  live: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.3,
    maxWidth: 820,
  },
  titleWide: {
    fontSize: 34,
    lineHeight: 42,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  metaItem: {
    gap: 4,
    minWidth: 100,
  },
  metaLabel: {
    color: colors.mutedSoft,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  barWrap: {
    width: '100%',
  },
  actions: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  actionsWide: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: 2,
  },
  yesBtn: {
    backgroundColor: colors.yes,
    shadowColor: colors.yes,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  noBtn: {
    backgroundColor: colors.no,
    shadowColor: colors.no,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  btnEyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  btnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
