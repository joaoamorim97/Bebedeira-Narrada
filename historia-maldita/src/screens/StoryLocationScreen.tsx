import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useStoryStore } from '../store/storyStore';
import GameButton from '../components/GameButton';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'StoryLocation'>;
};

export default function StoryLocationScreen({ navigation }: Props) {
  const session = useStoryStore(s => s.session);
  const [loading, setLoading] = useState(false);

  if (!session) return null;

  const handleStart = () => {
    navigation.replace('StoryGame');
  };

  const atmosphereEmoji: Record<string, string> = {
    sombrio: '🌑', caótico: '🌀', estranho: '👁️', misterioso: '🔮',
    assombrado: '👻', tenso: '⚡', bizarro: '🤡', sinistro: '💀',
  };

  const emoji = atmosphereEmoji[session.locationDescription?.toLowerCase()] || '📍';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.eyebrow}>Vocês chegaram em</Text>
          <Text style={styles.locationName}>{session.location}</Text>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descEmoji}>🏚️</Text>
          <Text style={styles.description}>{session.locationDescription}</Text>
        </View>

        <View style={styles.playersCard}>
          <Text style={styles.playersLabel}>Grupo presente</Text>
          <View style={styles.playersList}>
            {session.players.map((p, i) => (
              <View key={p.id} style={styles.playerChip}>
                <Text style={styles.playerChipText}>{p.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoLabel}>Rodadas</Text>
            <Text style={styles.infoValue}>{session.totalRounds}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoLabel}>Intensidade</Text>
            <Text style={styles.infoValue}>{session.intensity}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoLabel}>Jogadores</Text>
            <Text style={styles.infoValue}>{session.players.length}</Text>
          </View>
        </View>

        <GameButton
          label="Entrar no lugar 🚪"
          onPress={handleStart}
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
    paddingBottom: SPACING.xxl,
  },
  topSection: { alignItems: 'center', paddingTop: SPACING.lg },
  eyebrow: { color: COLORS.textMuted, fontSize: FONTS.small, marginBottom: SPACING.xs },
  locationName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  descriptionCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  descEmoji: { fontSize: 48 },
  description: {
    color: COLORS.text,
    fontSize: FONTS.body,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  playersCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  playersLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  playersList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  playerChip: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  playerChipText: { color: COLORS.text, fontSize: FONTS.small, fontWeight: '600' },
  infoRow: { flexDirection: 'row', gap: SPACING.sm },
  infoBadge: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  infoLabel: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginBottom: 2 },
  infoValue: { color: COLORS.text, fontSize: FONTS.body, fontWeight: '700' },
  btn: {},
});
