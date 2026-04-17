import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { GameIntensity, GameDuration } from '../types';
import { useGameStore } from '../store/gameStore';
import GameButton from '../components/GameButton';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Config'>;
  route: RouteProp<RootStackParamList, 'Config'>;
};

const INTENSITIES: { value: GameIntensity; label: string; desc: string; emoji: string }[] = [
  { value: 'leve', label: 'Leve', desc: 'Caos controlado, bom para começar', emoji: '😊' },
  { value: 'média', label: 'Média', desc: 'Equilíbrio entre diversão e punição', emoji: '😈' },
  { value: 'pesada', label: 'Pesada', desc: 'Sem piedade. Boa sorte.', emoji: '💀' },
];

const DURATIONS: { value: GameDuration; label: string; desc: string; rounds: number }[] = [
  { value: 'curta', label: 'Curta', desc: '~20 min', rounds: 8 },
  { value: 'média', label: 'Média', desc: '~30 min', rounds: 12 },
  { value: 'longa', label: 'Longa', desc: '~45 min', rounds: 16 },
];

export default function ConfigScreen({ navigation, route }: Props) {
  const { players } = route.params;
  const [intensity, setIntensity] = useState<GameIntensity>('média');
  const [duration, setDuration] = useState<GameDuration>('média');
  const createSession = useGameStore(s => s.createSession);

  const handleStart = () => {
    createSession(players, intensity, duration);
    navigation.navigate('Game');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Configurar</Text>
        <Text style={styles.subtitle}>{players.length} jogadores prontos</Text>

        <Text style={styles.sectionLabel}>Intensidade do caos</Text>
        {INTENSITIES.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, intensity === opt.value && styles.optionSelected]}
            onPress={() => setIntensity(opt.value)}
          >
            <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, intensity === opt.value && styles.optionLabelSelected]}>
                {opt.label}
              </Text>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
            {intensity === opt.value && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>Duração da partida</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.durationBtn, duration === opt.value && styles.durationSelected]}
              onPress={() => setDuration(opt.value)}
            >
              <Text style={[styles.durationLabel, duration === opt.value && styles.durationLabelSelected]}>
                {opt.label}
              </Text>
              <Text style={styles.durationDesc}>{opt.desc}</Text>
              <Text style={styles.durationRounds}>{opt.rounds} rodadas</Text>
            </TouchableOpacity>
          ))}
        </View>

        <GameButton label="Começar o jogo 💀" onPress={handleStart} style={styles.startBtn} />
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
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#1A0A2E',
  },
  optionEmoji: { fontSize: 24 },
  optionText: { flex: 1 },
  optionLabel: { color: COLORS.textSecondary, fontSize: FONTS.body, fontWeight: '700' },
  optionLabelSelected: { color: COLORS.text },
  optionDesc: { color: COLORS.textMuted, fontSize: FONTS.small, marginTop: 2 },
  check: { color: COLORS.primary, fontSize: FONTS.body, fontWeight: '900' },
  durationRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  durationBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  durationSelected: { borderColor: COLORS.primary, backgroundColor: '#1A0A2E' },
  durationLabel: { color: COLORS.textSecondary, fontSize: FONTS.body, fontWeight: '700' },
  durationLabelSelected: { color: COLORS.text },
  durationDesc: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginTop: 2 },
  durationRounds: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginTop: 2 },
  startBtn: { marginBottom: SPACING.sm },
});
