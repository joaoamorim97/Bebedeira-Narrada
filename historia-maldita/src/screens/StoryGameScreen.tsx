import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useStoryStore } from '../store/storyStore';
import { generateStoryScene, resolveStoryChoice } from '../services/storyService';
import ChoiceButton from '../components/ChoiceButton';
import ActiveRules from '../components/ActiveRules';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'StoryGame'>;
};

export default function StoryGameScreen({ navigation }: Props) {
  const session = useStoryStore(s => s.session);
  const isLoading = useStoryStore(s => s.isLoading);
  const setScene = useStoryStore(s => s.setScene);
  const setResult = useStoryStore(s => s.setResult);
  const setLoading = useStoryStore(s => s.setLoading);
  const applyRoundResult = useStoryStore(s => s.applyRoundResult);
  const markSceneLoading = useStoryStore(s => s.markSceneLoading);

  useEffect(() => {
    if (!session) return;
    if (session.gameState === 'finished') { navigation.replace('StoryFinale'); return; }
    if (session.gameState !== 'playing' || session.currentScene) return;

    // Chave única por turno — persiste no store, sobrevive a remontagens
    const key = `${session.currentRound}-${session.currentPlayerIndex}`;
    const canLoad = markSceneLoading(key);
    if (!canLoad) return; // já está carregando ou carregou esse turno

    const load = async () => {
      setLoading(true);
      const scene = await generateStoryScene(session);
      setScene(scene);
      setLoading(false);
    };
    load();
  }, [session?.gameState, session?.currentRound, session?.currentPlayerIndex, session?.currentScene]);

  const handleChoice = async (choice: string) => {
    if (!session || isLoading) return;
    setLoading(true);
    const { result, newSharedContext } = await resolveStoryChoice(session, choice);
    setResult(result, newSharedContext);
    applyRoundResult(choice);
    setLoading(false);
    navigation.navigate('StoryResult', { choiceMade: choice });
  };

  if (!session) return null;

  const currentPlayer = session.players[session.currentPlayerIndex];
  const scene = session.currentScene as any;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.location}>📍 {session.location}</Text>
          <Text style={styles.round}>
            Rodada {session.currentRound}/{session.totalRounds}
            {' · '}Turno {session.currentPlayerIndex + 1}/{session.players.length}
          </Text>
        </View>
        <View style={styles.playerBadge}>
          <Text style={styles.playerBadgeText}>{currentPlayer.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ActiveRules rules={session.activeRules} />

        {scene?.isGroupEvent && (
          <View style={styles.groupBanner}>
            <Text style={styles.groupBannerText}>
              👥 Evento coletivo — {session.players.map(p => p.name).join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.turnCard}>
          <Text style={styles.turnEmoji}>📖</Text>
          <Text style={styles.turnText}>
            {scene?.isGroupEvent ? 'Grupo decide — vez de' : 'Vez de'}
          </Text>
          <Text style={styles.turnName}>{currentPlayer.name}</Text>
        </View>

        {isLoading && !session.currentScene ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>A história continua...</Text>
          </View>
        ) : session.currentScene ? (
          <>
            <View style={styles.sceneCard}>
              <Text style={styles.sceneText}>{session.currentScene.sceneText}</Text>
            </View>
            <Text style={styles.choicesLabel}>
              {scene?.isGroupEvent ? 'O que o grupo faz?' : 'O que você faz?'}
            </Text>
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
          <View style={styles.resolvingArea}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>A história decide o destino...</Text>
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
  headerLeft: { flex: 1, marginRight: SPACING.sm },
  location: { color: COLORS.primaryLight, fontSize: FONTS.small, fontWeight: '700' },
  round: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginTop: 2 },
  playerBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  playerBadgeText: { color: COLORS.text, fontSize: FONTS.small, fontWeight: '700' },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  groupBanner: {
    backgroundColor: '#1A0A2E',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  groupBannerText: { color: COLORS.primaryLight, fontSize: FONTS.small, textAlign: 'center' },
  turnCard: { alignItems: 'center', marginBottom: SPACING.lg, paddingVertical: SPACING.sm },
  turnEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  turnText: { color: COLORS.textMuted, fontSize: FONTS.small },
  turnName: { color: COLORS.text, fontSize: FONTS.subtitle, fontWeight: '900' },
  loadingArea: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.small, textAlign: 'center' },
  sceneCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sceneText: { color: COLORS.text, fontSize: FONTS.body, lineHeight: 26, textAlign: 'center' },
  choicesLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  resolvingArea: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
});
