import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useStoryStore } from '../store/storyStore';
import DrinkCard from '../components/DrinkCard';
import GameButton from '../components/GameButton';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'StoryResult'>;
  route: RouteProp<RootStackParamList, 'StoryResult'>;
};

export default function StoryResultScreen({ navigation, route }: Props) {
  const session = useStoryStore(s => s.session);
  const advanceToNextTurn = useStoryStore(s => s.advanceToNextTurn);

  if (!session || !session.currentResult) return null;

  const currentPlayer = session.players[session.currentPlayerIndex];
  const leftPlayer = session.players[(session.currentPlayerIndex + 1) % session.players.length];
  const result = session.currentResult;
  const isLast = session.currentRound >= session.totalRounds &&
    session.currentPlayerIndex === session.players.length - 1;

  const handleNext = () => {
    advanceToNextTurn();
    if (isLast || session.gameState === 'finished') {
      navigation.replace('StoryFinale');
    } else {
      navigation.replace('StoryGame');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.choiceRecap}>
          <Text style={styles.choiceLabel}>{currentPlayer.name} escolheu:</Text>
          <Text style={styles.choiceText}>"{route.params.choiceMade}"</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>📖</Text>
          <Text style={styles.resultText}>{result.resultText}</Text>
        </View>

        <DrinkCard
          drinks={result.drinks}
          players={session.players}
          currentPlayerName={currentPlayer.name}
          leftPlayerName={leftPlayer.name}
        />

        {result.newRules.length > 0 && (
          <View style={styles.newRulesCard}>
            <Text style={styles.newRulesTitle}>📜 Nova regra</Text>
            {result.newRules.map((rule, i) => (
              <View key={i}>
                <Text style={styles.newRuleText}>{rule.ruleText}</Text>
                <Text style={styles.newRuleDuration}>por {rule.durationRounds} rodada{rule.durationRounds > 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        )}

        <GameButton
          label={isLast ? "Ver final da história 🏆" : "Continuar a história →"}
          onPress={handleNext}
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  choiceRecap: { marginBottom: SPACING.lg, alignItems: 'center' },
  choiceLabel: { color: COLORS.textMuted, fontSize: FONTS.small, marginBottom: SPACING.xs },
  choiceText: { color: COLORS.textSecondary, fontSize: FONTS.body, fontStyle: 'italic', textAlign: 'center' },
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
  resultText: { color: COLORS.text, fontSize: FONTS.body, lineHeight: 26, textAlign: 'center' },
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
  newRuleText: { color: COLORS.text, fontSize: FONTS.body, fontWeight: '600' },
  newRuleDuration: { color: COLORS.textMuted, fontSize: FONTS.small, marginTop: 2 },
  btn: { marginTop: SPACING.md },
});
