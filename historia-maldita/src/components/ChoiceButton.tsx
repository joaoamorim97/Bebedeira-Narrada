import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface Props {
  label: string;
  index: number;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const CHOICE_COLORS = [
  '#4A2080',
  '#1A4A80',
  '#804A1A',
  '#1A804A',
  '#80201A',
];

export default function ChoiceButton({ label, index, onPress, disabled, style }: Props) {
  const borderColor = CHOICE_COLORS[index % CHOICE_COLORS.length];

  return (
    <TouchableOpacity
      style={[styles.btn, { borderColor }, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.index}>{index + 1}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.choiceBtn,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  disabled: {
    opacity: 0.4,
  },
  index: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  label: {
    color: COLORS.text,
    fontSize: FONTS.body,
    flex: 1,
    lineHeight: 22,
  },
});
