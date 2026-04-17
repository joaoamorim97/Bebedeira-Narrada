import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import DrinkCard from '../components/DrinkCard';
import GameButton from '../components/GameButton';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

export default function ResultScreen({ navigation, route }: Props) {
  const session = useGameStore(s => s.session);
  const advanceToNextTurn = useGameStore(s => s.advanceToNextTurn);

  if (!session || !session.currentResult) return null;

  const currentPlayer = session.players[session.currentPlayerIndex];
  const leftPlayer = session.players[(session.currentPlayerIndex + 1) % session.players.length];
  const result = session.currentResult;
  const isLastRound = session.currentRound >= session.totalRounds &&
    session.currentPlayerIndex === session.players.length - 1;

  const handleNext = () => {
    advanceToNextTurn();
    if (session.gameState === 'finished' || isLastRound) {
      navigation.replace('Finale');
    } else {
      navigation.replace('Game');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Choice recap */}
        <View style={styles.choiceRecap}>
          <Text style={styles.choiceLabel}>{currentPlayer.name} escolheu:</Text>
          <Text style={styles.choiceText}>"{route.params.choiceMade}"</Text>
        </View>

        {/* Narrative result */}
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>💀</Text>
          <Text style={styles.resultText}>{result.resultText}</Text>
        </View>

        {/* Drinks */}
        <DrinkCard
          drinks={result.drinks}
          players={session.players}
          currentPlayerName={currentPlayer.name}
          leftPlayerName={leftPlayer.name}
        />

        {/* New rules */}
        {result.newRules.length > 0 && (
          <View style={styles.newRulesCard}>
            <Text style={styles.newRulesTitle}>📜 Nova regra</Text>
            {result.newRules.map((rule, i) => (
              <View key={i} style={styles.newRuleRow}>
                <Text style={styles.newRuleText}>{rule.ruleText}</Text>
                <Text style={styles.newRuleDuration}>por {rule.durationRounds} rodada{rule.durationRounds > 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        )}

        <GameButton
          label={isLastRound ? "Ver resultado final 🏆" : "Próxima rodada →"}
          onPress={handleNext}
          style={styles.nextBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  choiceRecap: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  choiceLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    marginBottom: SPACING.xs,
  },
  choiceText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.body,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  resultEmoji: { fontSize: 36, marginBottom: SPACING.md },
  resultText: {
    color: COLORS.text,
    fontSize: FONTS.body,
    lineHeight: 26,
    textAlign: 'center',
  },
  newRulesCard: {
    backgroundColor: '#1A1500',
    borderWidth: 1,
    borderColor: '#4A3800',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  newRulesTitle: {
    color: COLORS.gold,
    fontSize: FONTS.small,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  newRuleRow: {
    marginBottom: SPACING.xs,
  },
  newRuleText: {
    color: COLORS.text,
    fontSize: FONTS.body,
    fontWeight: '600',
  },
  newRuleDuration: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    marginTop: 2,
  },
  nextBtn: { marginTop: SPACING.md },
});
