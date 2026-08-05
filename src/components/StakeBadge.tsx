import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { UserPrediction } from '../types';
import { formatPts } from '../data';
import { colors, noSelect, radius, spacing } from '../theme';

type Props = {
  prediction: UserPrediction;
};

export function StakeBadge({ prediction }: Props) {
  const isYes = prediction.predictionType === 'YES';

  return (
    <View
      style={[
        styles.badge,
        isYes ? styles.yesBadge : styles.noBadge,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: isYes ? colors.yes : colors.no },
        ]}
      >
        You predicted {prediction.predictionType} with{' '}
        {formatPts(prediction.stakedAmount)} PTS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  yesBadge: {
    backgroundColor: colors.yesDim,
    borderColor: colors.yesBorder,
  },
  noBadge: {
    backgroundColor: colors.noDim,
    borderColor: colors.noBorder,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    ...noSelect,
  },
});
