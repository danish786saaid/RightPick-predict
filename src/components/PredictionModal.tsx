import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { ActivePrediction } from '../types';
import { formatPts } from '../data';
import { colors, noSelect, radius, spacing, useContentLayout } from '../theme';
import { StakeSlider } from './StakeSlider';

const MIN_STAKE = 10;
const MAX_STAKE = 500;
const TAP_MOVE_THRESHOLD = 8;

type Props = {
  active: ActivePrediction | null;
  points: number;
  onClose: () => void;
  onConfirm: (stake: number) => void;
};

export function PredictionModal({
  active,
  points,
  onClose,
  onConfirm,
}: Props) {
  const { width } = useContentLayout();
  const [stake, setStake] = useState(100);
  const [sliding, setSliding] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const hasBalance = points >= MIN_STAKE;
  const maxAllowed = hasBalance
    ? Math.min(MAX_STAKE, points)
    : MIN_STAKE;
  const cardWidth = Math.min(width * 0.85, 420);

  const slidingRef = useRef(false);
  const backdropPressOrigin = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (active) {
      const initial = hasBalance ? Math.min(100, maxAllowed) : 0;
      setStake(initial);
      slidingRef.current = false;
      setSliding(false);
      setAttempted(false);
    }
  }, [active, hasBalance, maxAllowed]);

  const odds = useMemo(() => {
    if (!active) return 1;
    return active.side === 'YES'
      ? active.market.yesOdds
      : active.market.noOdds;
  }, [active]);

  const potentialGain = Math.round(stake * (odds - 1));
  const potentialTotal = Math.round(stake * odds);

  const insufficient =
    !hasBalance || stake > points || stake < MIN_STAKE || stake <= 0;
  const canConfirm = !insufficient && Number.isFinite(stake);

  const sideColor = active?.side === 'YES' ? colors.yes : colors.no;

  const handleSlidingStart = () => {
    slidingRef.current = true;
    setSliding(true);
  };

  const handleSlidingComplete = () => {
    requestAnimationFrame(() => {
      slidingRef.current = false;
      setSliding(false);
    });
  };

  const tryCloseFromBackdrop = () => {
    if (slidingRef.current || sliding) return;
    onClose();
  };

  const handleConfirm = () => {
    setAttempted(true);
    if (!canConfirm) return;
    onConfirm(stake);
  };

  if (!active) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel="Dismiss stake modal"
          onPressIn={(e) => {
            if (slidingRef.current) {
              backdropPressOrigin.current = null;
              return;
            }
            backdropPressOrigin.current = {
              x: e.nativeEvent.pageX,
              y: e.nativeEvent.pageY,
            };
          }}
          onPress={(e) => {
            if (slidingRef.current || sliding) return;
            const origin = backdropPressOrigin.current;
            backdropPressOrigin.current = null;
            if (!origin) return;
            const dx = Math.abs(e.nativeEvent.pageX - origin.x);
            const dy = Math.abs(e.nativeEvent.pageY - origin.y);
            if (dx > TAP_MOVE_THRESHOLD || dy > TAP_MOVE_THRESHOLD) return;
            tryCloseFromBackdrop();
          }}
        />

        <View
          style={[styles.card, { width: cardWidth }]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => false}
        >
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Text style={styles.kicker}>STAKE AMOUNT</Text>
          <Text style={styles.stakeHero}>{formatPts(Math.max(0, stake))} PTS</Text>
          <Text style={styles.balanceHint}>
            Available · {formatPts(points)} PTS
          </Text>

          <View
            style={[
              styles.sidePill,
              active.side === 'YES' ? styles.yesPill : styles.noPill,
            ]}
          >
            <Text style={[styles.sideText, { color: sideColor }]}>
              Predicting {active.side} @ {odds}x
            </Text>
          </View>

          <Text style={styles.marketTitle} numberOfLines={2}>
            {active.market.title}
          </Text>

          <View
            style={styles.sliderBlock}
            onStartShouldSetResponderCapture={() => slidingRef.current}
          >
            {hasBalance ? (
              <StakeSlider
                value={Math.min(Math.max(stake, MIN_STAKE), maxAllowed)}
                minimumValue={MIN_STAKE}
                maximumValue={maxAllowed}
                step={10}
                onValueChange={(v) => {
                  setStake(v);
                  setAttempted(false);
                }}
                onSlidingStart={handleSlidingStart}
                onSlidingComplete={handleSlidingComplete}
              />
            ) : (
              <View style={styles.sliderDisabled}>
                <Text style={styles.sliderDisabledText}>
                  Not enough balance to place a stake
                </Text>
              </View>
            )}
            <View style={styles.rangeRow}>
              <Text style={styles.rangeText}>{MIN_STAKE}</Text>
              <Text style={styles.rangeHint}>Drag to adjust</Text>
              <Text style={styles.rangeText}>
                {formatPts(hasBalance ? maxAllowed : 0)}
              </Text>
            </View>
          </View>

          {(attempted && insufficient) || !hasBalance ? (
            <Text style={styles.error}>Insufficient PTS balance</Text>
          ) : null}

          <View style={styles.calcCard}>
            <Text style={styles.calcMain}>
              Win +{formatPts(Math.max(0, potentialGain))} PTS
            </Text>
            <Text style={styles.calcSub}>
              Return {formatPts(Math.max(0, potentialTotal))} PTS if correct
            </Text>
          </View>

          <Pressable
            disabled={!canConfirm}
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.confirm,
              !canConfirm && styles.confirmDisabled,
              pressed && canConfirm && styles.pressed,
            ]}
          >
            <Text style={styles.confirmText}>Confirm Prediction</Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    ...noSelect,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.overlay,
    ...noSelect,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
    zIndex: 2,
    ...noSelect,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  closeText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  kicker: {
    color: colors.mutedSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    ...noSelect,
  },
  stakeHero: {
    color: colors.brand,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: -4,
    ...noSelect,
  },
  balanceHint: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: -6,
    ...noSelect,
  },
  sidePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: spacing.xs,
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
    fontSize: 13,
    ...noSelect,
  },
  marketTitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    ...noSelect,
  },
  sliderBlock: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    ...noSelect,
  },
  sliderDisabled: {
    width: '100%',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.noDim,
    borderWidth: 1,
    borderColor: colors.noBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  sliderDisabledText: {
    color: colors.no,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  rangeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    ...noSelect,
  },
  rangeHint: {
    color: colors.mutedSoft,
    fontSize: 11,
    fontWeight: '600',
    ...noSelect,
  },
  error: {
    color: colors.no,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    ...noSelect,
  },
  calcCard: {
    width: '100%',
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    ...noSelect,
  },
  calcMain: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    ...noSelect,
  },
  calcSub: {
    color: colors.muted,
    fontSize: 13,
    ...noSelect,
  },
  confirm: {
    width: '100%',
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.brand,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  confirmDisabled: {
    opacity: 0.45,
  },
  confirmText: {
    color: colors.bg,
    fontWeight: '800',
    fontSize: 16,
    ...noSelect,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelText: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 14,
    ...noSelect,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
