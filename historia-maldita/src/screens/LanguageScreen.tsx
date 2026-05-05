import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useLanguageStore, Language } from '../store/languageStore';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Language'>;
};

const LANGUAGES: { code: Language; flag: string; label: string; sublabel: string }[] = [
  { code: 'pt', flag: 'ðŸ‡§ðŸ‡·', label: 'PortuguÃªs', sublabel: 'Brasil' },
  { code: 'es', flag: 'ðŸ‡ªðŸ‡¸', label: 'EspaÃ±ol', sublabel: 'LatinoamÃ©rica' },
  { code: 'en', flag: 'ðŸ‡ºðŸ‡¸', label: 'English', sublabel: 'United States' },
];

export default function LanguageScreen({ navigation }: Props) {
  const setLanguage = useLanguageStore(s => s.setLanguage);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Story Shot</Text>
        <Text style={styles.subtitle}>Escolha o idioma Â· Choose language Â· Elige idioma</Text>

        <View style={styles.options}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={styles.langBtn}
              onPress={() => handleSelect(lang.code)}
              activeOpacity={0.75}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.langText}>
                <Text style={styles.langLabel}>{lang.label}</Text>
                <Text style={styles.langSub}>{lang.sublabel}</Text>
              </View>
              <Text style={styles.arrow}>â€º</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  logo: { width: 120, height: 120, marginBottom: SPACING.md },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.small,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  options: { alignSelf: 'stretch', gap: SPACING.sm },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  flag: { fontSize: 36 },
  langText: { flex: 1 },
  langLabel: { color: COLORS.text, fontSize: FONTS.body, fontWeight: '700' },
  langSub: { color: COLORS.textMuted, fontSize: FONTS.small, marginTop: 2 },
  arrow: { color: COLORS.textMuted, fontSize: 24 },
});

