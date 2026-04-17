import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useStoryStore } from '../store/storyStore';
import { generateStoryFinale } from '../services/storyService';
import GameButton from '../components/GameButton';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'StoryFinale'>;
};

export default function StoryFinaleScreen({ navigation }: Props) {
  const session = useStoryStore(s => s.session);
  const resetSession = useStoryStore(s => s.resetSession);
  const [finaleText, setFinaleText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    generateStoryFinale(session).then(t => { setFinaleText(t); setLoading(false); });
  }, []);

  if (!session) return null;

  const sorted = [...session.players].sort((a, b) => b.totalSips - a.totalSips);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.trophy}>📖</Text>
        <Text style={styles.title}>Fim da História</Text>
        <Text style={styles.location}>📍 {session.location}</Text>

        {loading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Escrevendo o epílogo...</Text>
          </View>
        ) : (
          <View style={styles.narrativeCard}>
            <Text style={styles.narrativeText}>{finaleText}</Text>
          </View>
        )}

        <View style={styles.rankingCard}>
          <Text style={styles.rankingTitle}>📊 Placar final</Text>
          {sorted.map((p, i) => (
            <View key={p.id} style={styles.rankRow}>
              <Text style={styles.rankPos}>#{i + 1}</Text>
              <Text style={styles.rankName}>{p.name}</Text>
              <View style={styles.sipsBadge}>
                <Text style={styles.sipsText}>{p.totalSips} goles</Text>
              </View>
              {i === 0 && <Text style={styles.badge}>😵</Text>}
              {i === sorted.length - 1 && sorted.length > 1 && <Text style={styles.badge}>😇</Text>}
            </View>
          ))}
        </View>

        <GameButton
          label="Jogar novamente 🎲"
          onPress={() => { resetSession(); navigation.replace('Home'); }}
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl, alignItems: 'center' },
  trophy: { fontSize: 64, marginBottom: SPACING.sm },
  title: { fontSize: FONTS.title, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  location: { color: COLORS.primaryLight, fontSize: FONTS.small, marginBottom: SPACING.xl, textAlign: 'center' },
  loadingArea: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.md, alignSelf: 'stretch' },
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
  narrativeText: { color: COLORS.text, fontSize: FONTS.body, lineHeight: 26, textAlign: 'center', fontStyle: 'italic' },
  rankingCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
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
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs, gap: SPACING.sm },
  rankPos: { color: COLORS.textMuted, fontSize: FONTS.small, width: 24 },
  rankName: { color: COLORS.text, fontSize: FONTS.body, flex: 1, fontWeight: '600' },
  sipsBadge: { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  sipsText: { color: COLORS.text, fontSize: FONTS.tiny, fontWeight: '700' },
  badge: { fontSize: 18 },
  btn: { alignSelf: 'stretch' },
});
