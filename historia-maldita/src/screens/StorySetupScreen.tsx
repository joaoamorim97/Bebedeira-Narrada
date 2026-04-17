import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { GameIntensity } from '../types';
import { useStoryStore } from '../store/storyStore';
import { generateLocationDescription } from '../services/storyService';
import GameButton from '../components/GameButton';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'StorySetup'>;
  route: RouteProp<RootStackParamList, 'StorySetup'>;
};

const INTENSITIES: { value: GameIntensity; label: string; emoji: string; desc: string }[] = [
  { value: 'leve', label: 'Leve', emoji: '😊', desc: 'Sarcasmo suave' },
  { value: 'média', label: 'Média', emoji: '😈', desc: 'Caos moderado' },
  { value: 'pesada', label: 'Pesada', emoji: '💀', desc: 'Sem piedade' },
];

export default function StorySetupScreen({ navigation, route }: Props) {
  const { players } = route.params;
  const [location, setLocation] = useState('');
  const [intensity, setIntensity] = useState<GameIntensity>('média');
  const [rounds, setRounds] = useState(4);
  const [loading, setLoading] = useState(false);
  const createSession = useStoryStore(s => s.createSession);

  const handleStart = async () => {
    if (!location.trim()) return;
    setLoading(true);
    const { description } = await generateLocationDescription(location.trim(), players, intensity);
    createSession(players, location.trim(), description, intensity, rounds);
    setLoading(false);
    navigation.navigate('StoryLocation');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Modo História</Text>
        <Text style={styles.subtitle}>A IA cria uma história no lugar que você escolher</Text>

        <Text style={styles.label}>Onde a história acontece?</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Ex: bar de faculdade, castelo assombrado, metrô..."
          placeholderTextColor={COLORS.textMuted}
          maxLength={60}
          autoCapitalize="sentences"
          autoFocus
        />
        <Text style={styles.hint}>Quanto mais específico, mais engraçado fica</Text>

        <Text style={styles.label}>Intensidade</Text>
        <View style={styles.intensityRow}>
          {INTENSITIES.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.intensityBtn, intensity === opt.value && styles.intensitySelected]}
              onPress={() => setIntensity(opt.value)}
            >
              <Text style={styles.intensityEmoji}>{opt.emoji}</Text>
              <Text style={[styles.intensityLabel, intensity === opt.value && styles.intensityLabelSelected]}>
                {opt.label}
              </Text>
              <Text style={styles.intensityDesc}>{opt.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.playerList}>
          <Text style={styles.playerListLabel}>Jogadores ({players.length})</Text>
          <Text style={styles.playerNames}>{players.join(' · ')}</Text>
        </View>

        <Text style={styles.label}>Quantidade de rounds (máx 8)</Text>
        <View style={styles.roundsRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.roundBtn, rounds === n && styles.roundBtnSelected]}
              onPress={() => setRounds(n)}
            >
              <Text style={[styles.roundBtnText, rounds === n && styles.roundBtnTextSelected]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.hint}>
          ~{Math.round(rounds * players.length * 1.5)} min estimados
        </Text>

        <GameButton
          label={loading ? 'Criando o lugar...' : 'Começar a história 📖'}
          onPress={handleStart}
          disabled={!location.trim()}
          loading={loading}
          style={styles.btn}
        />
        <GameButton label="Voltar" onPress={() => navigation.goBack()} variant="ghost" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  title: { fontSize: FONTS.title, fontWeight: '900', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { color: COLORS.textMuted, fontSize: FONTS.small, marginBottom: SPACING.xl },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.body,
    marginBottom: SPACING.xs,
  },
  hint: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginBottom: SPACING.xl },
  intensityRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  intensityBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 4,
  },
  intensitySelected: { borderColor: COLORS.primary, backgroundColor: '#1A0A2E' },
  intensityEmoji: { fontSize: 22 },
  intensityLabel: { color: COLORS.textSecondary, fontSize: FONTS.small, fontWeight: '700' },
  intensityLabelSelected: { color: COLORS.text },
  intensityDesc: { color: COLORS.textMuted, fontSize: FONTS.tiny, textAlign: 'center' },
  playerList: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  playerListLabel: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginBottom: 4 },
  playerNames: { color: COLORS.text, fontSize: FONTS.small },
  btn: { marginBottom: SPACING.sm },
  roundsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xs },
  roundBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  roundBtnSelected: { borderColor: COLORS.primary, backgroundColor: '#1A0A2E' },
  roundBtnText: { color: COLORS.textSecondary, fontSize: FONTS.body, fontWeight: '700' },
  roundBtnTextSelected: { color: COLORS.text },
});
