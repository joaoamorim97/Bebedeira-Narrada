import { GameSession, SceneData, RoundResult } from '../types';
import { FALLBACK_SCENES_BY_LANG, FALLBACK_RESULTS_BY_LANG } from '../constants/fallback';
import { apiPost } from '../constants/api';
import { useLanguageStore } from '../store/languageStore';

function getLang() { return useLanguageStore.getState().language; }
function fallbackScene(): SceneData {
  const s = FALLBACK_SCENES_BY_LANG[getLang()];
  return s[Math.floor(Math.random() * s.length)];
}
function fallbackResult(): RoundResult {
  const r = FALLBACK_RESULTS_BY_LANG[getLang()];
  return r[Math.floor(Math.random() * r.length)];
}

export async function generateScene(session: GameSession): Promise<SceneData> {
  const lang = getLang();
  const currentPlayer = session.players[session.currentPlayerIndex];
  try {
    const data = await apiPost('/api/scene', {
      players: session.players.map(p => p.name),
      currentPlayer: currentPlayer.name,
      round: session.currentRound,
      totalRounds: session.totalRounds,
      intensity: session.intensity,
      activeRules: session.activeRules.map(r => r.ruleText).join('; ') || 'none',
      recentHistory: session.recentHistory.slice(-3)
        .map(h => `${h.playerName}: ${h.choiceMade} → ${h.resultText}`).join(' | ') || 'start',
      lang,
    });
    if (!data.scene_text || !Array.isArray(data.choices)) throw new Error('Invalid scene structure');
    return { sceneText: data.scene_text, choices: data.choices.slice(0, 5) };
  } catch (e: any) {
    console.error('[llmService] scene failed, using fallback:', e.message);
    return fallbackScene();
  }
}

export async function resolveChoice(session: GameSession, choiceMade: string): Promise<RoundResult> {
  const lang = getLang();
  const currentPlayer = session.players[session.currentPlayerIndex];
  try {
    const data = await apiPost('/api/resolve', {
      players: session.players.map(p => p.name),
      currentPlayer: currentPlayer.name,
      round: session.currentRound,
      intensity: session.intensity,
      sceneText: session.currentScene?.sceneText || '',
      choiceMade,
      activeRules: session.activeRules.map(r => r.ruleText).join('; ') || 'none',
      lang,
    });
    if (!data.result_text) throw new Error('Invalid result structure');
    return {
      resultText: data.result_text,
      drinks: (data.drinks || []).map((d: any) => ({
        playerName: d.player_name || d.playerName,
        sips: Number(d.sips) || 1,
      })),
      newRules: (data.new_rules || []).map((r: any) => ({
        ruleText: r.rule_text || r.ruleText,
        durationRounds: Number(r.duration_rounds || r.durationRounds) || 1,
        target: r.target || 'all',
      })),
    };
  } catch (e: any) {
    console.error('[llmService] resolve failed, using fallback:', e.message);
    return fallbackResult();
  }
}

export async function generateFinalNarrative(session: GameSession): Promise<string> {
  const lang = getLang();
  const mostSips = [...session.players].sort((a, b) => b.totalSips - a.totalSips)[0];
  try {
    const data = await apiPost('/api/finale', {
      players: session.players.map(p => ({ name: p.name, sips: p.totalSips })),
      totalRounds: session.totalRounds,
      intensity: session.intensity,
      mostPunished: mostSips?.name || '',
      lang,
    });
    return data.finale_text || getFallbackFinale(lang, mostSips?.name);
  } catch (e: any) {
    console.error('[llmService] finale failed:', e.message);
    return getFallbackFinale(lang, mostSips?.name);
  }
}

function getFallbackFinale(lang: string, name = 'Alguém'): string {
  if (lang === 'es') return `La maldición fue saciada. ${name} cargó el peso del caos. La historia termina... por ahora.`;
  if (lang === 'en') return `The curse was satisfied. ${name} carried the weight of chaos. The story ends... for now.`;
  return `A maldição foi saciada. ${name} carregou o peso do caos. A história termina... por enquanto.`;
}
