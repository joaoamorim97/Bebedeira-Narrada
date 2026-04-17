import { create } from 'zustand';
import {
  StorySession, Player, GameIntensity, GameState,
  SceneData, RoundResult, TemporaryRule, StoryTurn
} from '../types';
import { GAME_LIMITS } from '../constants/fallback';

const STORY_ROUNDS = 8;

interface StoryStore {
  session: StorySession | null;
  isLoading: boolean;
  // Chave do turno que já teve cena carregada — persiste entre remontagens
  loadedSceneKey: string;

  createSession: (players: string[], location: string, locationDescription: string, intensity: GameIntensity, rounds?: number) => void;
  resetSession: () => void;
  setScene: (scene: SceneData) => void;
  setResult: (result: RoundResult, newSharedContext?: string) => void;
  applyRoundResult: (choiceMade: string) => void;
  advanceToNextTurn: () => void;
  setLoading: (v: boolean) => void;
  markSceneLoading: (key: string) => boolean; // retorna false se já está carregando essa chave
}

function clampResult(result: RoundResult): RoundResult {
  const { maxSipsPerPlayer, maxPlayersAffected, maxNewRulesPerRound, maxRuleDuration } = GAME_LIMITS;
  return {
    ...result,
    drinks: result.drinks.slice(0, maxPlayersAffected).map(d => ({ ...d, sips: Math.min(d.sips, maxSipsPerPlayer) })),
    newRules: result.newRules.slice(0, maxNewRulesPerRound).map(r => ({ ...r, durationRounds: Math.min(r.durationRounds, maxRuleDuration) })),
  };
}

let pendingSharedContext = '';

export const useStoryStore = create<StoryStore>((set, get) => ({
  session: null,
  isLoading: false,
  loadedSceneKey: '',

  createSession: (playerNames, location, locationDescription, intensity, rounds = STORY_ROUNDS) => {
    pendingSharedContext = '';
    const players: Player[] = playerNames.map((name, i) => ({
      id: `p_${i}`, name, order: i, totalSips: 0, temporaryStatuses: [],
    }));
    set({
      loadedSceneKey: '',
      session: {
        id: `story_${Date.now()}`,
        players, location, locationDescription, intensity,
        currentRound: 1,
        currentPlayerIndex: 0,
        totalRounds: rounds,
        activeRules: [],
        history: [],
        gameState: 'playing',
        currentScene: null,
        currentResult: null,
        sharedContext: '',
      }
    });
  },

  resetSession: () => {
    pendingSharedContext = '';
    set({ session: null, isLoading: false, loadedSceneKey: '' });
  },

  // Tenta marcar a chave como "carregando". Retorna true se pode prosseguir, false se já foi marcada.
  markSceneLoading: (key: string) => {
    const { loadedSceneKey } = get();
    if (loadedSceneKey === key) return false; // já está carregando ou carregou
    set({ loadedSceneKey: key });
    return true;
  },

  setScene: (scene) => set(s => ({
    session: s.session ? { ...s.session, currentScene: scene, currentResult: null } : null
  })),

  setResult: (result, newSharedContext) => {
    if (newSharedContext) pendingSharedContext = newSharedContext;
    set(s => ({
      session: s.session ? { ...s.session, currentResult: result } : null
    }));
  },

  applyRoundResult: (choiceMade) => {
    const { session } = get();
    if (!session || !session.currentResult || !session.currentScene) return;

    const result = clampResult(session.currentResult);
    const currentPlayer = session.players[session.currentPlayerIndex];

    const updatedPlayers = session.players.map(player => {
      let extra = 0;
      for (const d of result.drinks) {
        if (
          d.playerName === player.name ||
          d.playerName === 'ALL' ||
          (d.playerName === 'CURRENT' && player.id === currentPlayer.id) ||
          (d.playerName === 'LEFT' && player.order === (currentPlayer.order + 1) % session.players.length)
        ) extra += d.sips;
      }
      return { ...player, totalSips: player.totalSips + extra };
    });

    const decremented = session.activeRules
      .map(r => ({ ...r, durationRounds: r.durationRounds - 1 }))
      .filter(r => r.durationRounds > 0);

    const newRules: TemporaryRule[] = result.newRules.map((r, i) => ({
      ...r, id: `rule_${Date.now()}_${i}`, createdAtRound: session.currentRound,
    }));

    const turn: StoryTurn = {
      round: session.currentRound,
      playerName: currentPlayer.name,
      sceneText: session.currentScene.sceneText,
      choiceMade,
      resultText: result.resultText,
      affectedPlayers: result.drinks.map(d => d.playerName),
    };

    set(s => ({
      session: s.session ? {
        ...s.session,
        players: updatedPlayers,
        activeRules: [...decremented, ...newRules],
        history: [...s.session!.history, turn],
        currentResult: result,
        sharedContext: pendingSharedContext || s.session!.sharedContext,
        gameState: 'result',
      } : null
    }));
  },

  advanceToNextTurn: () => {
    const { session } = get();
    if (!session) return;

    const scene = session.currentScene as any;
    // Evento coletivo com TODOS os jogadores: consome a rodada inteira, pula para próxima
    const isFullGroupEvent = scene?.isGroupEvent &&
      Array.isArray(scene?.involvedPlayers) &&
      scene.involvedPlayers.length === session.players.length;

    let nextIdx: number;
    let nextRound: number;

    if (isFullGroupEvent) {
      // Pula direto para início da próxima rodada
      nextIdx = 0;
      nextRound = session.currentRound + 1;
    } else {
      nextIdx = (session.currentPlayerIndex + 1) % session.players.length;
      nextRound = nextIdx === 0 ? session.currentRound + 1 : session.currentRound;
    }

    if (nextRound > session.totalRounds) {
      set(s => ({ session: s.session ? { ...s.session, gameState: 'finished' } : null }));
      return;
    }

    set(s => ({
      loadedSceneKey: '',
      session: s.session ? {
        ...s.session,
        currentPlayerIndex: nextIdx,
        currentRound: nextRound,
        currentScene: null,
        currentResult: null,
        gameState: 'playing',
      } : null
    }));
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
