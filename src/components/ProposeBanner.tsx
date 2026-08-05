import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  onSubmitted: (topic: string) => void;
};

export function ProposeBanner({ onSubmitted }: Props) {
  const [topic, setTopic] = useState('');

  const submit = () => {
    const trimmed = topic.trim();
    if (!trimmed) return;

    onSubmitted(trimmed);
    setTopic('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Community</Text>
      <Text style={styles.title}>Propose a Topic</Text>
      <Text style={styles.sub}>
        Suggest a Hong Kong question for crowd review and forecasting.
      </Text>

      <TextInput
        value={topic}
        onChangeText={setTopic}
        placeholder="e.g. Will Lantau Tomorrow project open Phase 1 by 2030?"
        placeholderTextColor={colors.mutedSoft}
        style={styles.input}
        multiline
      />

      <Pressable
        onPress={submit}
        disabled={!topic.trim()}
        style={({ pressed }) => [
          styles.btn,
          !topic.trim() && styles.btnDisabled,
          pressed && !!topic.trim() && styles.pressed,
        ]}
      >
        <Text style={styles.btnText}>Submit for Review</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xxl,
    padding: spacing.xxxl,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    gap: spacing.md,
    marginTop: spacing.xxl,
    marginBottom: spacing.huge,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sub: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: spacing.lg,
    minHeight: 88,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  btn: {
    marginTop: spacing.sm,
    backgroundColor: colors.brand,
    paddingVertical: 15,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: colors.bg,
    fontWeight: '800',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.9,
  },
});
