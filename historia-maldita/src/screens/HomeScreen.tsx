import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleArea}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Bebedeira Narrada</Text>
          <Text style={styles.subtitle}>O party game que te amaldiçoa</Text>
        </View>

        <View style={styles.modes}>
          <Text style={styles.modesLabel}>Escolha o modo</Text>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => navigation.navigate('Players')}
            activeOpacity={0.8}
          >
            <Text style={styles.modeEmoji}>🎲</Text>
            <View style={styles.modeText}>
              <Text style={styles.modeName}>Modo Clássico</Text>
              <Text style={styles.modeDesc}>Cenas aleatórias, caos puro, maldições imprevisíveis</Text>
            </View>
            <Text style={styles.modeArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, styles.modeCardStory]}
            onPress={() => navigation.navigate('Players', { mode: 'story' } as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.modeEmoji}>📖</Text>
            <View style={styles.modeText}>
              <Text style={styles.modeName}>Modo História</Text>
              <Text style={styles.modeDesc}>Você escolhe o lugar, a IA cria a história com sarcasmo</Text>
            </View>
            <Text style={styles.modeArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('HowToPlay')}>
          <Text style={styles.howToPlay}>Como jogar?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Costs')} style={styles.costsBtn}>
          <Text style={styles.costsText}>💰 Gastos da IA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxl,
  },
  titleArea: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  logo: { width: 160, height: 160, marginBottom: SPACING.md },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: { fontSize: FONTS.body, color: COLORS.textMuted, marginTop: SPACING.sm, textAlign: 'center' },
  modes: { marginBottom: SPACING.lg },
  modesLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  modeCardStory: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#120820',
  },
  modeEmoji: { fontSize: 32 },
  modeText: { flex: 1 },
  modeName: { color: COLORS.text, fontSize: FONTS.body, fontWeight: '700', marginBottom: 2 },
  modeDesc: { color: COLORS.textMuted, fontSize: FONTS.small, lineHeight: 18 },
  modeArrow: { color: COLORS.textMuted, fontSize: 24 },
  howToPlay: { color: COLORS.textMuted, fontSize: FONTS.small, textAlign: 'center', marginBottom: SPACING.xs },
  costsBtn: { alignItems: 'center' },
  costsText: { color: COLORS.textMuted, fontSize: FONTS.tiny },
});
