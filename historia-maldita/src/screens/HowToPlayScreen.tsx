import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import GameButton from '../components/GameButton';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'HowToPlay'>;
};

const steps = [
  { icon: '👥', title: 'Reúna o grupo', desc: 'De 3 a 10 jogadores. Um celular, passado de mão em mão.' },
  { icon: '⚙️', title: 'Configure a partida', desc: 'Escolha a intensidade do caos e a duração do jogo.' },
  { icon: '📖', title: 'Leia a cena', desc: 'A narradora apresenta uma situação absurda e sobrenatural.' },
  { icon: '👆', title: 'Escolha uma ação', desc: 'Toque em uma das opções. Sem falar, sem improvisar.' },
  { icon: '💀', title: 'Receba a consequência', desc: 'A maldição decide quem bebe e quanto. Sem apelação.' },
  { icon: '🔄', title: 'Próximo jogador', desc: 'Passe o celular. A maldição continua.' },
];

export default function HowToPlayScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Como Jogar</Text>

        {steps.map((step, i) => (
          <View key={i} style={styles.step}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.warning}>
          <Text style={styles.warningText}>⚠️ Beba com responsabilidade. Ninguém é obrigado a beber de verdade.</Text>
        </View>

        <GameButton
          label="Entendi, vamos jogar"
          onPress={() => navigation.navigate('Players')}
          style={styles.btn}
        />
        <GameButton
          label="Voltar"
          onPress={() => navigation.goBack()}
          variant="ghost"
          style={styles.backBtn}
        />
      </ScrollView>
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
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  stepIcon: { fontSize: 28 },
  stepText: { flex: 1 },
  stepTitle: {
    color: COLORS.text,
    fontSize: FONTS.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    lineHeight: 20,
  },
  warning: {
    backgroundColor: '#1A1000',
    borderWidth: 1,
    borderColor: '#4A3000',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  warningText: {
    color: COLORS.gold,
    fontSize: FONTS.small,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: { marginBottom: SPACING.sm },
  backBtn: {},
});
