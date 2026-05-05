import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useT } from '../store/languageStore';
import { API_BASE_URL } from '../constants/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

type WakeStatus = 'idle' | 'waking' | 'ok' | 'fail';

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 90000;

export default function HomeScreen({ navigation }: Props) {
  const t = useT();
  const [wakeStatus, setWakeStatus] = useState<WakeStatus>('idle');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  const handleWake = async () => {
    if (wakeStatus === 'waking') return;
    setWakeStatus('waking');
    stopPolling();

    const tryFetch = async (): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(`${API_BASE_URL}/api/costs`, { signal: controller.signal });
        clearTimeout(fetchTimeout);
        return res.ok;
      } catch {
        return false;
      }
    };

    // Try immediately first
    const firstTry = await tryFetch();
    if (firstTry) {
      setWakeStatus('ok');
      setTimeout(() => setWakeStatus('idle'), 3000);
      return;
    }

    // Poll every 5 seconds for up to 90 seconds total
    pollingRef.current = setInterval(async () => {
      const ok = await tryFetch();
      if (ok) {
        stopPolling();
        setWakeStatus('ok');
        setTimeout(() => setWakeStatus('idle'), 3000);
      }
    }, POLL_INTERVAL_MS);

    // Give up after 90 seconds
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setWakeStatus('fail');
      setTimeout(() => setWakeStatus('idle'), 3000);
    }, POLL_TIMEOUT_MS);
  };

  const wakeLabel = wakeStatus === 'waking' ? t.waking
    : wakeStatus === 'ok' ? t.wakeOk
    : wakeStatus === 'fail' ? t.wakeFail
    : t.wakeBackend;

  const wakeBg = wakeStatus === 'ok' ? '#0A2A0A'
    : wakeStatus === 'fail' ? '#2A0A0A'
    : COLORS.surface;

  const wakeBorder = wakeStatus === 'ok' ? COLORS.success
    : wakeStatus === 'fail' ? COLORS.accent
    : COLORS.border;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleArea}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t.appName}</Text>
          <Text style={styles.subtitle}>{t.tagline}</Text>
        </View>

        <View style={styles.modes}>
          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => navigation.navigate('Players')}
            activeOpacity={0.8}
          >
            <Text style={styles.modeEmoji}>🎲</Text>
            <View style={styles.modeText}>
              <Text style={styles.modeName}>{t.classicMode}</Text>
              <Text style={styles.modeDesc}>{t.classicDesc}</Text>
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
              <Text style={styles.modeName}>{t.storyMode}</Text>
              <Text style={styles.modeDesc}>{t.storyDesc}</Text>
            </View>
            <Text style={styles.modeArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Wake backend button */}
        <TouchableOpacity
          style={[styles.wakeBtn, { backgroundColor: wakeBg, borderColor: wakeBorder }]}
          onPress={handleWake}
          disabled={wakeStatus === 'waking'}
          activeOpacity={0.7}
        >
          {wakeStatus === 'waking'
            ? <ActivityIndicator size="small" color={COLORS.textMuted} />
            : <Text style={styles.wakeText}>{wakeLabel}</Text>
          }
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <TouchableOpacity onPress={() => navigation.navigate('HowToPlay')}>
            <Text style={styles.link}>{t.howToPlay}</Text>
          </TouchableOpacity>
          <Text style={styles.dot}>·</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Costs')}>
            <Text style={styles.link}>{t.costs}</Text>
          </TouchableOpacity>
          <Text style={styles.dot}>·</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Language')}>
            <Text style={styles.link}>🌐</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: SPACING.xl,
  },
  titleArea: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  logo: { width: 140, height: 140, marginBottom: SPACING.sm },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: FONTS.small, color: COLORS.textMuted, marginTop: SPACING.xs, textAlign: 'center' },
  modes: { gap: SPACING.sm, marginBottom: SPACING.md },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  modeCardStory: { borderColor: COLORS.primaryLight, backgroundColor: '#120820' },
  modeEmoji: { fontSize: 28 },
  modeText: { flex: 1 },
  modeName: { color: COLORS.text, fontSize: FONTS.body, fontWeight: '700', marginBottom: 2 },
  modeDesc: { color: COLORS.textMuted, fontSize: FONTS.small, lineHeight: 18 },
  modeArrow: { color: COLORS.textMuted, fontSize: 24 },
  wakeBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  wakeText: { color: COLORS.textMuted, fontSize: FONTS.small },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  link: { color: COLORS.textMuted, fontSize: FONTS.small },
  dot: { color: COLORS.textMuted, fontSize: FONTS.small },
});
