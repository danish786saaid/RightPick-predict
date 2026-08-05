import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  yesPct: number;
  height?: number;
  showLabels?: boolean;
  large?: boolean;
};

export function ProbabilityBar({
  yesPct,
  height = 10,
  showLabels = true,
  large = false,
}: Props) {
  const noPct = 100 - yesPct;
  const trackHeight = large ? Math.max(height, 14) : height;

  return (
    <View style={[styles.wrap, large && styles.wrapLarge]}>
      {showLabels && (
        <View style={styles.labels}>
          <Text style={[styles.yesLabel, large && styles.labelLarge]}>
            {yesPct}% YES
          </Text>
          <Text style={[styles.noLabel, large && styles.labelLarge]}>
            {noPct}% NO
          </Text>
        </View>
      )}
      <View style={[styles.track, { height: trackHeight }]}>
        <View
          style={[
            styles.yesFill,
            { width: `${yesPct}%`, height: trackHeight },
          ]}
        />
        <View
          style={[
            styles.noFill,
            { width: `${noPct}%`, height: trackHeight },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    width: '100%',
  },
  wrapLarge: {
    gap: 14,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yesLabel: {
    color: colors.yes,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  noLabel: {
    color: colors.no,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  labelLarge: {
    fontSize: 16,
  },
  track: {
    flexDirection: 'row',
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: colors.border,
    width: '100%',
  },
  yesFill: {
    backgroundColor: colors.yes,
  },
  noFill: {
    backgroundColor: colors.no,
  },
});
