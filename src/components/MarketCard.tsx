import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Market, PredictionSide, UserPrediction } from '../types';
import { formatPts } from '../data';
import { colors, radius, spacing } from '../theme';
import { ProbabilityBar } from './ProbabilityBar';
import { StakeBadge } from './StakeBadge';

const CATEGORY_EMOJI: Record<string, string> = {
  weather: '🌧️',
  transit: '🚇',
  economy: '🏢',
  local: '🍔',
};

type Props = {
  market: Market;
  onPredict: (side: PredictionSide) => void;
  width?: number;
  userStake?: UserPrediction;
};

export function MarketCard({ market, onPredict, width, userStake }: Props) {
  return (
    <View style={[styles.card, width ? { width } : null]}>
      <View style={styles.top}>
        <View style={styles.catPill}>
          <Text style={styles.catText}>
            {CATEGORY_EMOJI[market.category]} {market.category.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.ends}>Ends in {market.endsIn}</Text>
      </View>

      <Text style={styles.title}>{market.title}</Text>

      {userStake ? <StakeBadge prediction={userStake} /> : null}

      <Text style={styles.meta}>
        {formatPts(market.participants)} predictors ·{' '}
        {formatPts(market.ptsStaked)} PTS staked
      </Text>

      <ProbabilityBar yesPct={market.yesPct} height={10} />

      <View style={styles.actions}>
        <Pressable
          onPress={() => onPredict('YES')}
          style={({ pressed }) => [
            styles.btn,
            styles.yesBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.yesText}>YES {market.yesOdds}x</Text>
        </Pressable>
        <Pressable
          onPress={() => onPredict('NO')}
          style={({ pressed }) => [
            styles.btn,
            styles.noBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.noText}>NO {market.noOdds}x</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catPill: {
    backgroundColor: colors.bgSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  ends: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  yesBtn: {
    backgroundColor: colors.yesDim,
    borderColor: colors.yesBorder,
  },
  noBtn: {
    backgroundColor: colors.noDim,
    borderColor: colors.noBorder,
  },
  yesText: {
    color: colors.yes,
    fontWeight: '800',
    fontSize: 14,
  },
  noText: {
    color: colors.no,
    fontWeight: '800',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
});
