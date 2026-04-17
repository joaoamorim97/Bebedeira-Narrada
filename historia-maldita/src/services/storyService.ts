import { StorySession, SceneData, RoundResult } from '../types';
import { FALLBACK_SCENES, FALLBACK_RESULTS } from '../constants/fallback';
import { apiPost } from '../constants/api';

const fallbackScene = (): SceneData =>
  FALLBACK_SCENES[Math.floor(Math.random() * FALLBACK_SCENES.length)];
const fallbackResult = (): RoundResult =>
  FALLBACK_RESULTS[Math.floor(Math.random() * FALLBACK_RESULTS.length)];

export async function generateLocationDescription(
  location: string, players: string[], intensity: string
): Promise<{ description: string; atmosphere: string }> {
  try {
    const data = await apiPost('/api/story/describe', { location, players, intensity });
    return { description: data.description || location, atmosphere: data.atmosphere || 'misterioso' };
  } catch (e: any) {
    console.error('[storyService] describe failed:', e.message);
    return { description: `Um ${location} com clima tenso e iluminação duvidosa.`, atmosphere: 'estranho' };
  }
}

export async function generateStoryScene(session: StorySession): Promise<SceneData> {
  const currentPlayer = session.players[session.currentPlayerIndex];
  // Evento coletivo: 30% de chance a partir da rodada 2
  const isGroupEvent = session.players.length >= 2 &&
    session.currentRound > 1 &&
    Math.random() < 0.3;

  try {
    const data = await apiPost('/api/story/scene', {
      players: session.players.map(p => p.name),
      currentPlayer: currentPlayer.name,
      round: session.currentRound,
      totalRounds: session.totalRounds,
      location: session.location,
      locationDescription: session.locationDescription,
      intensity: session.intensity,
      activeRules: session.activeRules.map(r => r.ruleText).join('; ') || 'nenhuma',
      history: session.history.slice(-3),
      sharedContext: session.sharedContext,
      isGroupEvent,
      allPlayers: session.players.map(p => p.name),
    });

    if (!data.scene_text || !Array.isArray(data.choices)) {
      throw new Error(`Invalid scene structure: ${JSON.stringify(data).slice(0, 100)}`);
    }
    return {
      sceneText: data.scene_text,
      choices: data.choices.slice(0, 4),
      isGroupEvent: data.is_group_event || isGroupEvent,
      involvedPlayers: data.involved_players || [currentPlayer.name],
    } as any;
  } catch (e: any) {
    console.error('[storyService] scene failed, using fallback:', e.message);
    return fallbackScene();
  }
}

export async function resolveStoryChoice(
  session: StorySession, choiceMade: string
): Promise<{ result: RoundResult; newSharedContext: string }> {
  const currentPlayer = session.players[session.currentPlayerIndex];
  try {
    const data = await apiPost('/api/story/resolve', {
      players: session.players.map(p => p.name),
      currentPlayer: currentPlayer.name,
      sceneText: session.currentScene?.sceneText || '',
      choiceMade,
      intensity: session.intensity,
      activeRules: session.activeRules.map(r => r.ruleText).join('; ') || 'nenhuma',
      locationDescription: session.locationDescription,
      sharedContext: session.sharedContext,
      isGroupEvent: (session.currentScene as any)?.isGroupEvent || false,
      involvedPlayers: (session.currentScene as any)?.involvedPlayers || [currentPlayer.name],
    });

    if (!data.result_text) throw new Error(`Invalid resolve structure: ${JSON.stringify(data).slice(0, 100)}`);

    return {
      result: {
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
      },
      newSharedContext: data.new_shared_context || '',
    };
  } catch (e: any) {
    console.error('[storyService] resolve failed, using fallback:', e.message);
    return { result: fallbackResult(), newSharedContext: '' };
  }
}

export async function generateStoryFinale(session: StorySession): Promise<string> {
  const mostSips = [...session.players].sort((a, b) => b.totalSips - a.totalSips)[0];
  try {
    const data = await apiPost('/api/story/finale', {
      players: session.players.map(p => ({ name: p.name, sips: p.totalSips })),
      location: session.location,
      totalRounds: session.totalRounds,
      mostPunished: mostSips?.name || '',
    });
    return data.finale_text || getFallbackFinale(session);
  } catch (e: any) {
    console.error('[storyService] finale failed:', e.message);
    return getFallbackFinale(session);
  }
}

function getFallbackFinale(session: StorySession): string {
  const top = [...session.players].sort((a, b) => b.totalSips - a.totalSips)[0];
  return `A história de ${session.location} chegou ao fim. ${top?.name || 'Alguém'} vai lembrar dessa noite — ou não vai lembrar de nada.`;
}
