import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import GameButton from '../components/GameButton';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Players'>;
  route: RouteProp<RootStackParamList, 'Players'>;
};

export default function PlayersScreen({ navigation, route }: Props) {
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [inputValue, setInputValue] = useState('');
  const mode = route.params?.mode || 'classic';

  const validPlayers = players.filter(p => p.trim().length > 0);
  const canStart = validPlayers.length >= 2;
  const canAdd = players.length < 12;

  const updatePlayer = (index: number, value: string) => {
    const updated = [...players];
    updated[index] = value;
    setPlayers(updated);
  };

  const addPlayer = () => {
    if (canAdd) setPlayers([...players, '']);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const names = players.filter(p => p.trim().length > 0).map(p => p.trim());
    if (mode === 'story') {
      navigation.navigate('StorySetup', { players: names });
    } else {
      navigation.navigate('Config', { players: names });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Jogadores</Text>
          <Text style={styles.subtitle}>Adicione de 2 a 12 jogadores</Text>

          {players.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={player}
                onChangeText={(v) => updatePlayer(index, v)}
                placeholder={`Jogador ${index + 1}`}
                placeholderTextColor={COLORS.textMuted}
                maxLength={20}
                autoCapitalize="words"
              />
              {players.length > 2 && (
                <TouchableOpacity onPress={() => removePlayer(index)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {canAdd && (
            <TouchableOpacity style={styles.addBtn} onPress={addPlayer}>
              <Text style={styles.addText}>+ Adicionar jogador</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.counter}>
            {validPlayers.length}/12 jogadores {validPlayers.length < 2 ? `(mínimo 2)` : '✓'}
          </Text>

          <GameButton
            label="Próximo →"
            onPress={handleNext}
            disabled={!canStart}
            style={styles.nextBtn}
          />
          <GameButton
            label="Voltar"
            onPress={() => navigation.goBack()}
            variant="ghost"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  title: {
    fontSize: FONTS.title,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    marginBottom: SPACING.xl,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    color: COLORS.text,
    fontSize: FONTS.small,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: FONTS.body,
    height: 48,
  },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: COLORS.accent,
    fontSize: FONTS.body,
    fontWeight: '700',
  },
  addBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.body,
  },
  counter: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  nextBtn: { marginBottom: SPACING.sm },
});
