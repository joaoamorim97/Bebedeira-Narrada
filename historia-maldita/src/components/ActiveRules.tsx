import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TemporaryRule } from '../types';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface Props {
  rules: TemporaryRule[];
}

export default function ActiveRules({ rules }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (rules.length === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.header}>
        <Text style={styles.headerText}>⚠️ {rules.length} regra{rules.length > 1 ? 's' : ''} ativa{rules.length > 1 ? 's' : ''}</Text>
        <Text style={styles.toggle}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded && rules.map(rule => (
        <View key={rule.id} style={styles.ruleRow}>
          <Text style={styles.ruleText}>{rule.ruleText}</Text>
          <Text style={styles.duration}>{rule.durationRounds}r</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1500',
    borderWidth: 1,
    borderColor: '#4A3800',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  headerText: {
    color: COLORS.gold,
    fontSize: FONTS.small,
    fontWeight: '700',
  },
  toggle: {
    color: COLORS.gold,
    fontSize: FONTS.tiny,
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#2A2000',
  },
  ruleText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    flex: 1,
  },
  duration: {
    color: COLORS.gold,
    fontSize: FONTS.tiny,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
});
