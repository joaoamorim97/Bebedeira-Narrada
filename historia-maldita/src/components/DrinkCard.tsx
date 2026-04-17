import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrinkPenalty } from '../types';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface Props {
  drinks: DrinkPenalty[];
  players: { name: string }[];
  currentPlayerName: string;
  leftPlayerName: string;
}

export default function DrinkCard({ drinks, players, currentPlayerName, leftPlayerName }: Props) {
  if (drinks.length === 0) return (
    <View style={styles.container}>
      <Text style={styles.nodrink}>✨ Ninguém bebe dessa vez!</Text>
    </View>
  );

  const resolvedDrinks = drinks.map(d => {
    let name = d.playerName;
    if (d.playerName === 'CURRENT') name = currentPlayerName;
    else if (d.playerName === 'LEFT') name = leftPlayerName;
    else if (d.playerName === 'ALL') name = 'Todos';
    return { ...d, playerName: name };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍺 Quem bebe</Text>
      {resolvedDrinks.map((d, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.name}>{d.playerName}</Text>
          <View style={styles.sipsBadge}>
            <Text style={styles.sips}>{d.sips} {d.sips === 1 ? 'gole' : 'goles'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A0A00',
    borderWidth: 1,
    borderColor: '#5A2A00',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.accentOrange,
    fontSize: FONTS.small,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  name: {
    color: COLORS.text,
    fontSize: FONTS.body,
    fontWeight: '600',
  },
  sipsBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  sips: {
    color: COLORS.text,
    fontSize: FONTS.small,
    fontWeight: '700',
  },
  nodrink: {
    color: COLORS.success,
    fontSize: FONTS.body,
    textAlign: 'center',
    fontWeight: '600',
  },
});
