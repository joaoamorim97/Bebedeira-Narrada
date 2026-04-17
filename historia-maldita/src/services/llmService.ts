import { GameSession, SceneData, RoundResult } from '../types';
import { FALLBACK_SCENES, FALLBACK_RESULTS } from '../constants/fallback';
import { apiPost } from '../constants/api';

function getRandomFallbackScene(): SceneData {
  return FALLBACK_SCENES[Math.floor(Math.random() * FALLBACK_SCENES.length)];
}
function getRandomFallbackResult(): RoundResult {
  return FALLBACK_RESULTS[Math.floor(Math.random() * FALLBACK_RESULTS.length)];
}

export async function generateScene(session: GameSession): Promise<SceneData> {
  const currentPlayer = session.players[session.currentPlayerIndex];
  try {
    const data = await apiPost('/api/scene', {
      players: session.players.map(p => p.name),
      currentPlayer: currentPlayer.name,
      round: session.currentRound,
      totalRounds: session.totalRounds,
      intensity: session.intensity,
      activeRules: session.activeRules.map(r => r.ruleText).join('; ') || 'nenhuma',
      recentHistory: session.recentHistory.slice(-3)
        .map(h => `${h.playerName}: ${h.choiceMade} → ${h.resultText}`).join(' | ') || 'início',
    });
    if (!data.scene_text || !Array.isArray(data.choices)) throw new Error('Invalid scene structure');
    return { sceneText: data.scene_text, choices: data.choices.slice(0, 5) };
  } catch (e: any) {
    console.error('[llmService] scene failed, using fallback:', e.message);
    return getRandomFallbackScene();
  }
}

export async function resolveChoice(session: GameSession, choiceMade: string): Promise<RoundResult> {
  const currentPlayer = session.players[session.currentPlayerIndex];
  try {
    const data = await apiPost('/api/resolve', {
      players: session.players.map(p => p.name),
      currentPlayer: currentPlayer.name,
      round: session.currentRound,
      intensity: session.intensity,
      sceneText: session.currentScene?.sceneText || '',
      choiceMade,
      activeRules: session.activeRules.map(r => r.ruleText).join('; ') || 'nenhuma',
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
    return getRandomFallbackResult();
  }
}

export async function generateFinalNarrative(session: GameSession): Promise<string> {
  const mostSips = [...session.players].sort((a, b) => b.totalSips - a.totalSips)[0];
  try {
    const data = await apiPost('/api/finale', {
      players: session.players.map(p => ({ name: p.name, sips: p.totalSips })),
      totalRounds: session.totalRounds,
      intensity: session.intensity,
      mostPunished: mostSips?.name || '',
    });
    return data.finale_text || getFallbackFinale(session);
  } catch (e: any) {
    console.error('[llmService] finale failed:', e.message);
    return getFallbackFinale(session);
  }
}

function getFallbackFinale(session: GameSession): string {
  const mostSips = [...session.players].sort((a, b) => b.totalSips - a.totalSips)[0];
  return `A maldição foi saciada. ${mostSips?.name || 'Alguém'} carregou o peso do caos. A história termina... por enquanto.`;
}
