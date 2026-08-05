import React from 'react';
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { CATEGORIES } from '../data';
import type { CategoryId } from '../types';
import { colors, radius, spacing, useContentLayout } from '../theme';

type Props = {
  active: CategoryId;
  onChange: (id: CategoryId) => void;
};

export function CategoryChips({ active, onChange }: Props) {
  const { pad } = useContentLayout();

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, { paddingHorizontal: pad }]}
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === active;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onChange(cat.id)}
              style={({ pressed }) => [
                styles.chip,
                isActive && styles.chipActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  row: {
    gap: 12,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  chipActive: {
    backgroundColor: colors.brandDim,
    borderColor: colors.brand,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  labelActive: {
    color: colors.brand,
  },
});
