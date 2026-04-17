import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { generateScene, resolveChoice } from '../services/llmService';
import ChoiceButton from '../components/ChoiceButton';
import ActiveRules from '../components/ActiveRules';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Game'>;
};

export default function GameScreen({ navigation }: Props) {
  const session = useGameStore(s => s.session);
  const isLoading = useGameStore(s => s.isLoading);
  const setScene = useGameStore(s => s.setScene);
  const setResult = useGameStore(s => s.setResult);
  const setLoading = useGameStore(s => s.setLoading);
  const applyRoundResult = useGameStore(s => s.applyRoundResult);
  const setGameState = useGameStore(s => s.setGameState);
  const markSceneLoading = useGameStore(s => s.markSceneLoading);

  useEffect(() => {
    if (!session) return;
    if (session.gameState === 'finished') { navigation.replace('Finale'); return; }
    if (session.gameState !== 'playing' || session.currentScene) return;

    const key = `${session.currentRound}-${session.currentPlayerIndex}`;
    if (!markSceneLoading(key)) return;

    const load = async () => {
      setLoading(true);
      const scene = await generateScene(session);
      setScene(scene);
      setLoading(false);
    };
    load();
  }, [session?.gameState, session?.currentRound, session?.currentPlayerIndex, session?.currentScene]);

  const handleChoice = async (choice: string) => {
    if (!session || isLoading) return;
    setLoading(true);
    const result = await resolveChoice(session, choice);
    setResult(result);
    applyRoundResult(choice);
    setLoading(false);
    navigation.navigate('Result', { choiceMade: choice });
  };

  if (!session) return null;

  const currentPlayer = session.players[session.currentPlayerIndex];
  const screenWidth = Dimensions.get('window').width - 48 - SPACING.md * 2; // header padding
  const progressWidth = Math.floor((screenWidth * (session.currentRound - 1)) / session.totalRounds);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.roundLabel}>Rodada {session.currentRound}/{session.totalRounds}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>
        <View style={styles.playerBadge}>
          <Text style={styles.playerBadgeText}>{currentPlayer.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ActiveRules rules={session.activeRules} />

        {/* Turn indicator */}
        <View style={styles.turnCard}>
          <Text style={styles.turnEmoji}>🎲</Text>
          <Text style={styles.turnText}>Vez de</Text>
          <Text style={styles.turnName}>{currentPlayer.name}</Text>
        </View>

        {/* Scene */}
        {isLoading && !session.currentScene ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>A maldição está se formando...</Text>
          </View>
        ) : session.currentScene ? (
          <>
            <View style={styles.sceneCard}>
              <Text style={styles.sceneText}>{session.currentScene.sceneText}</Text>
            </View>

            <Text style={styles.choicesLabel}>O que você faz?</Text>
            {session.currentScene.choices.map((choice, i) => (
              <ChoiceButton
                key={i}
                label={choice}
                index={i}
                onPress={() => handleChoice(choice)}
                disabled={isLoading}
              />
            ))}
          </>
        ) : null}

        {isLoading && session.currentScene && (
          <View style={styles.resolvingOverlay}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>A maldição decide seu destino...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { flex: 1, marginRight: SPACING.md },
  roundLabel: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginBottom: 4 },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  playerBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  playerBadgeText: { color: COLORS.text, fontSize: FONTS.small, fontWeight: '700' },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  turnCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  turnEmoji: { fontSize: 32, marginBottom: SPACING.xs },
  turnText: { color: COLORS.textMuted, fontSize: FONTS.small },
  turnName: { color: COLORS.text, fontSize: FONTS.subtitle, fontWeight: '900' },
  loadingArea: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.md,
  },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.small, textAlign: 'center' },
  sceneCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sceneText: {
    color: COLORS.text,
    fontSize: FONTS.body,
    lineHeight: 26,
    textAlign: 'center',
  },
  choicesLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  resolvingOverlay: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
});
