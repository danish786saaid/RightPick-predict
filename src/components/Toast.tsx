import React, { useEffect } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  message: string | null;
  onHide: () => void;
  pad?: number;
};

export function Toast({ message, onHide, pad = spacing.lg }: Props) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onHide();
    });
  }, [message, onHide, opacity]);

  if (!message) return null;

  return (
    <Animated.View
      style={[styles.toast, { opacity, left: pad, right: pad }]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 108,
    alignSelf: 'center',
    maxWidth: 520,
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: colors.yes,
    borderRadius: radius.xl,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    shadowColor: colors.yes,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});
