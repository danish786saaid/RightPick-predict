import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import type { UserPrediction } from '../types';
import { formatPts, USER } from '../data';
import {
  colors,
  noSelect,
  radius,
  spacing,
  useContentLayout,
} from '../theme';

type Props = {
  predictions: UserPrediction[];
};

type Segment = 'active' | 'settled';

export function MyPredictionsScreen({ predictions }: Props) {
  const { pad } = useContentLayout();
  const [segment, setSegment] = useState<Segment>('active');

  const active = useMemo(
    () =>
      predictions
        .filter((p) => p.status === 'ACTIVE')
        .sort((a, b) => b.timestamp - a.timestamp),
    [predictions],
  );

  const history = useMemo(
    () =>
      predictions
        .filter((p) => p.status === 'SETTLED')
        .sort((a, b) => b.timestamp - a.timestamp),
    [predictions],
  );

  const totalStaked = active.reduce((sum, p) => sum + p.stakedAmount, 0);
  const potentialWin = active.reduce(
    (sum, p) => sum + p.potentialPayout,
    0,
  );

  const list = segment === 'active' ? active : history;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingHorizontal: pad }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>My Bets</Text>
      <Text style={styles.sub}>
        Track open stakes and settled Hong Kong forecasts.
      </Text>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Staked</Text>
          <Text style={styles.summaryValue}>
            {formatPts(totalStaked)} PTS
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Potential Win</Text>
          <Text style={[styles.summaryValue, styles.potential]}>
            {formatPts(potentialWin)} PTS
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Accuracy</Text>
          <Text style={styles.summaryValue}>{USER.accuracy}%</Text>
        </View>
      </View>

      <View style={styles.segment}>
        <Pressable
          onPress={() => setSegment('active')}
          style={[
            styles.segmentBtn,
            segment === 'active' && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              segment === 'active' && styles.segmentTextActive,
            ]}
          >
            Active ({active.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSegment('settled')}
          style={[
            styles.segmentBtn,
            segment === 'settled' && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              segment === 'settled' && styles.segmentTextActive,
            ]}
          >
            Settled ({history.length})
          </Text>
        </Pressable>
      </View>

      {list.length === 0 ? (
        <Text style={styles.empty}>
          {segment === 'active'
            ? 'No active predictions yet. Stake on a market to see it here.'
            : 'No settled predictions yet.'}
        </Text>
      ) : (
        list.map((pred) => (
          <PredictionRow key={pred.id} prediction={pred} />
        ))
      )}
    </ScrollView>
  );
}

function PredictionRow({ prediction }: { prediction: UserPrediction }) {
  const isActive = prediction.status === 'ACTIVE';
  const isYes = prediction.predictionType === 'YES';
  const isWin = prediction.result === 'WIN';
  const profit = prediction.potentialPayout - prediction.stakedAmount;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View
          style={[
            styles.sidePill,
            isYes ? styles.yesPill : styles.noPill,
          ]}
        >
          <Text
            style={[
              styles.sideText,
              { color: isYes ? colors.yes : colors.no },
            ]}
          >
            {prediction.predictionType} · {prediction.odds}x
          </Text>
        </View>

        {isActive ? (
          <Text style={styles.ends}>
            Ends in {prediction.endsIn ?? '—'}
          </Text>
        ) : (
          <View
            style={[
              styles.resultBadge,
              isWin ? styles.winBadge : styles.lossBadge,
            ]}
          >
            <Text
              style={[
                styles.resultText,
                { color: isWin ? colors.yes : colors.no },
              ]}
            >
              {isWin
                ? `+${formatPts(prediction.settledPnl ?? profit)} PTS WIN`
                : `${formatPts(prediction.settledPnl ?? -prediction.stakedAmount)} PTS LOSS`}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{prediction.marketTitle}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Staked</Text>
          <Text style={styles.statValue}>
            {formatPts(prediction.stakedAmount)} PTS
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            {isActive ? 'Potential return' : 'Payout'}
          </Text>
          <Text style={[styles.statValue, isActive && styles.potential]}>
            {isActive
              ? `${formatPts(prediction.potentialPayout)} PTS`
              : isWin
                ? `+${formatPts(prediction.settledPnl ?? profit)} PTS`
                : '0 PTS'}
          </Text>
        </View>
        {isActive ? (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>If correct</Text>
            <Text style={[styles.statValue, styles.potential]}>
              +{formatPts(profit)} PTS
            </Text>
          </View>
        ) : null}
      </View>
    </View>
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
  },
  heading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    ...noSelect,
  },
  sub: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
    ...noSelect,
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    minWidth: 100,
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    alignSelf: 'stretch',
  },
  summaryLabel: {
    color: colors.mutedSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    ...noSelect,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    ...noSelect,
  },
  potential: {
    color: colors.brand,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.brandDim,
  },
  segmentText: {
    color: colors.muted,
    fontWeight: '700',
    fontSize: 13,
    ...noSelect,
  },
  segmentTextActive: {
    color: colors.brand,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.xxxl,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  sidePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  yesPill: {
    backgroundColor: colors.yesDim,
    borderColor: colors.yesBorder,
  },
  noPill: {
    backgroundColor: colors.noDim,
    borderColor: colors.noBorder,
  },
  sideText: {
    fontWeight: '800',
    fontSize: 12,
    ...noSelect,
  },
  ends: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    ...noSelect,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  winBadge: {
    backgroundColor: colors.yesDim,
    borderColor: colors.yesBorder,
  },
  lossBadge: {
    backgroundColor: colors.noDim,
    borderColor: colors.noBorder,
  },
  resultText: {
    fontWeight: '800',
    fontSize: 12,
    ...noSelect,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    ...noSelect,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  stat: {
    gap: 3,
    minWidth: 90,
  },
  statLabel: {
    color: colors.mutedSoft,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    ...noSelect,
  },
  statValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    ...noSelect,
  },
});
