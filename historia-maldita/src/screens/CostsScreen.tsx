import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { apiGet, apiDelete } from '../constants/api';
import GameButton from '../components/GameButton';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Costs'>;
};

interface CostData {
  model: string;
  callCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUSD: number;
  totalCostBRL: number;
  recentCalls: {
    timestamp: string;
    endpoint: string;
    inputTokens: number;
    outputTokens: number;
    costUSD: number;
  }[];
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function CostsScreen({ navigation }: Props) {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchCosts = async () => {
    setLoading(true);
    try {
      const json = await apiGet('/api/costs');
      setData(json);
    } catch (e: any) {
      console.error('[CostsScreen] fetch failed:', e.message);
      setData(null);
    }
    setLoading(false);
  };

  const resetCosts = async () => {
    setResetting(true);
    try {
      await apiDelete('/api/costs');
      await fetchCosts();
    } catch {}
    setResetting(false);
  };

  useEffect(() => { fetchCosts(); }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Controle de Gastos</Text>
        <TouchableOpacity onPress={fetchCosts}>
          <Text style={styles.refresh}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : !data ? (
          <View style={styles.errorArea}>
            <Text style={styles.errorText}>Backend offline ou sem dados</Text>
            <GameButton label="Tentar novamente" onPress={fetchCosts} variant="ghost" />
          </View>
        ) : (
          <>
            <Text style={styles.modelLabel}>{data.model}</Text>

            {/* Totais */}
            <View style={styles.totalsRow}>
              <View style={styles.totalCard}>
                <Text style={styles.totalValue}>{data.callCount}</Text>
                <Text style={styles.totalLabel}>chamadas</Text>
              </View>
              <View style={styles.totalCard}>
                <Text style={styles.totalValue}>${data.totalCostUSD.toFixed(4)}</Text>
                <Text style={styles.totalLabel}>USD</Text>
              </View>
              <View style={[styles.totalCard, styles.totalCardHighlight]}>
                <Text style={[styles.totalValue, styles.totalValueHighlight]}>R${data.totalCostBRL.toFixed(3)}</Text>
                <Text style={styles.totalLabel}>BRL</Text>
              </View>
            </View>

            <View style={styles.tokensRow}>
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenValue}>{data.totalInputTokens.toLocaleString()}</Text>
                <Text style={styles.tokenLabel}>tokens input</Text>
              </View>
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenValue}>{data.totalOutputTokens.toLocaleString()}</Text>
                <Text style={styles.tokenLabel}>tokens output</Text>
              </View>
            </View>

            {/* Estimativa por partida */}
            {data.callCount > 0 && (
              <View style={styles.estimateCard}>
                <Text style={styles.estimateTitle}>Estimativa por partida</Text>
                <Text style={styles.estimateValue}>
                  ~R${((data.totalCostBRL / data.callCount) * 20).toFixed(3)}
                </Text>
                <Text style={styles.estimateNote}>baseado em ~20 chamadas/partida</Text>
              </View>
            )}

            {/* Chamadas recentes */}
            {data.recentCalls.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Últimas chamadas</Text>
                {data.recentCalls.slice().reverse().map((call, i) => (
                  <View key={i} style={styles.callRow}>
                    <Text style={styles.callTime}>{formatTime(call.timestamp)}</Text>
                    <Text style={styles.callEndpoint}>{call.endpoint}</Text>
                    <Text style={styles.callCost}>${call.costUSD.toFixed(5)}</Text>
                  </View>
                ))}
              </View>
            )}

            <GameButton
              label="Zerar contador"
              onPress={resetCosts}
              loading={resetting}
              variant="danger"
              style={styles.resetBtn}
            />
          </>
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  back: { color: COLORS.primary, fontSize: FONTS.body },
  title: { color: COLORS.text, fontSize: FONTS.body, fontWeight: '700' },
  refresh: { color: COLORS.primary, fontSize: 22 },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  loadingArea: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.small },
  errorArea: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  errorText: { color: COLORS.textMuted, fontSize: FONTS.body, textAlign: 'center' },
  modelLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.tiny,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  totalsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  totalCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalCardHighlight: { borderColor: COLORS.primary, backgroundColor: '#1A0A2E' },
  totalValue: { color: COLORS.text, fontSize: FONTS.subtitle, fontWeight: '900' },
  totalValueHighlight: { color: COLORS.primaryLight },
  totalLabel: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginTop: 2 },
  tokensRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  tokenBadge: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  tokenValue: { color: COLORS.text, fontSize: FONTS.body, fontWeight: '700' },
  tokenLabel: { color: COLORS.textMuted, fontSize: FONTS.tiny },
  estimateCard: {
    backgroundColor: '#0A1A0A',
    borderWidth: 1,
    borderColor: '#1A4A1A',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  estimateTitle: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginBottom: 4 },
  estimateValue: { color: COLORS.success, fontSize: 28, fontWeight: '900' },
  estimateNote: { color: COLORS.textMuted, fontSize: FONTS.tiny, marginTop: 4 },
  recentSection: { marginBottom: SPACING.lg },
  recentTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  callTime: { color: COLORS.textMuted, fontSize: FONTS.tiny, width: 60 },
  callEndpoint: { color: COLORS.textSecondary, fontSize: FONTS.tiny, flex: 1 },
  callCost: { color: COLORS.gold, fontSize: FONTS.tiny, fontWeight: '700' },
  resetBtn: { marginTop: SPACING.md },
});
