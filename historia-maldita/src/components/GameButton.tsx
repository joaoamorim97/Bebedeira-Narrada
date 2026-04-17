import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function GameButton({ label, onPress, variant = 'primary', disabled, loading, style, textStyle }: Props) {
  const btnStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'danger' && styles.danger,
    variant === 'ghost' && styles.ghost,
    (disabled || loading) && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity style={btnStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.75}>
      {loading
        ? <ActivityIndicator color={COLORS.text} />
        : <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel, textStyle]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  danger: {
    backgroundColor: COLORS.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: COLORS.text,
    fontSize: FONTS.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  ghostLabel: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
