import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { generateFinalNarrative } from '../services/llmService';
import GameButton from '../components/GameButton';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Finale'>;
};

export default function FinaleScreen({ navigation }: Props) {
  const session = useGameStore(s => s.session);
  const resetSession = useGameStore(s => s.resetSession);
  const [finaleText, setFinaleText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    generateFinalNarrative(session).then(text => {
      setFinaleText(text);
      setLoading(false);
    });
  }, []);

  if (!session) return null;

  const sortedByDrinks = [...session.players].sort((a, b) => b.totalSips - a.totalSips);
  const mostPunished = sortedByDrinks[0];
  const leastPunished = sortedByDrinks[sortedByDrinks.length - 1];

  const handlePlayAgain = () => {
    resetSession();
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.title}>Fim da Maldição</Text>
        <Text style={styles.subtitle}>{session.totalRounds} rodadas de caos puro</Text>

        {loading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>A maldição escreve seu epitáfio...</Text>
          </View>
        ) : (
          <View style={styles.narrativeCard}>
            <Text style={styles.narrativeText}>{finaleText}</Text>
          </View>
        )}

        {/* Rankings */}
        <View style={styles.rankingCard}>
          <Text style={styles.rankingTitle}>📊 Resumo da carnificina</Text>
          {sortedByDrinks.map((player, i) => (
            <View key={player.id} style={styles.rankRow}>
              <Text style={styles.rankPos}>#{i + 1}</Text>
              <Text style={styles.rankName}>{player.name}</Text>
              <View style={styles.rankSips}>
                <Text style={styles.rankSipsText}>{player.totalSips} goles</Text>
              </View>
              {i === 0 && <Text style={styles.rankBadge}>😵</Text>}
              {i === sortedByDrinks.length - 1 && sortedByDrinks.length > 1 && <Text style={styles.rankBadge}>😇</Text>}
            </View>
          ))}
        </View>

        {/* Highlights */}
        <View style={styles.highlightsRow}>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightEmoji}>💀</Text>
            <Text style={styles.highlightLabel}>Mais amaldiçoado</Text>
            <Text style={styles.highlightName}>{mostPunished?.name}</Text>
          </View>
          <View style={styles.highlightCard}>
            <Text style={styles.highlightEmoji}>✨</Text>
            <Text style={styles.highlightLabel}>Sobrevivente</Text>
            <Text style={styles.highlightName}>{leastPunished?.name}</Text>
          </View>
        </View>

        <GameButton label="Jogar novamente 🎲" onPress={handlePlayAgain} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl, alignItems: 'center' },
  trophy: { fontSize: 64, marginBottom: SPACING.sm },
  title: {
    fontSize: FONTS.title,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  loadingArea: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
    alignSelf: 'stretch',
  },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.small },
  narrativeCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignSelf: 'stretch',
  },
  narrativeText: {
    color: COLORS.text,
    fontSize: FONTS.body,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  rankingCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignSelf: 'stretch',
  },
  rankingTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  rankPos: { color: COLORS.textMuted, fontSize: FONTS.small, width: 24 },
  rankName: { color: COLORS.text, fontSize: FONTS.body, flex: 1, fontWeight: '600' },
  rankSips: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  rankSipsText: { color: COLORS.text, fontSize: FONTS.tiny, fontWeight: '700' },
  rankBadge: { fontSize: 18 },
  highlightsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    alignSelf: 'stretch',
  },
  highlightCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  highlightEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  highlightLabel: { color: COLORS.textMuted, fontSize: FONTS.tiny, textAlign: 'center', marginBottom: 4 },
  highlightName: { color: COLORS.text, fontSize: FONTS.body, fontWeight: '700', textAlign: 'center' },
  btn: { alignSelf: 'stretch' },
});
