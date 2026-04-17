import { create } from 'zustand';
import {
  GameSession, Player, GameIntensity, GameDuration,
  SceneData, RoundResult, TemporaryRule, HistoryEntry, GameState
} from '../types';
import { GAME_DURATION_ROUNDS, GAME_LIMITS } from '../constants/fallback';

interface GameStore {
  session: GameSession | null;
  isLoading: boolean;
  error: string | null;
  loadedSceneKey: string;

  // Setup
  createSession: (players: string[], intensity: GameIntensity, duration: GameDuration) => void;
  resetSession: () => void;

  // Game flow
  setScene: (scene: SceneData) => void;
  setResult: (result: RoundResult) => void;
  setGameState: (state: GameState) => void;
  applyRoundResult: (choiceMade: string) => void;
  advanceToNextTurn: () => void;
  markSceneLoading: (key: string) => boolean;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

function validateAndClampResult(result: RoundResult, players: Player[]): RoundResult {
  const { maxSipsPerPlayer, maxPlayersAffected, maxNewRulesPerRound, maxRuleDuration } = GAME_LIMITS;

  // Clamp drinks
  let drinks = result.drinks
    .slice(0, maxPlayersAffected)
    .map(d => ({ ...d, sips: Math.min(d.sips, maxSipsPerPlayer) }));

  // Clamp new rules
  let newRules = result.newRules
    .slice(0, maxNewRulesPerRound)
    .map(r => ({ ...r, durationRounds: Math.min(r.durationRounds, maxRuleDuration) }));

  return { ...result, drinks, newRules };
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  isLoading: false,
  error: null,
  loadedSceneKey: '',

  createSession: (playerNames, intensity, duration) => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player_${index}`,
      name,
      order: index,
      totalSips: 0,
      temporaryStatuses: [],
    }));

    const session: GameSession = {
      id: `session_${Date.now()}`,
      players,
      currentRound: 1,
      currentPlayerIndex: 0,
      intensity,
      duration,
      totalRounds: GAME_DURATION_ROUNDS[duration],
      activeRules: [],
      recentHistory: [],
      gameState: 'playing',
      currentScene: null,
      currentResult: null,
    };

    set({ session, error: null });
  },

  resetSession: () => set({ session: null, error: null, isLoading: false, loadedSceneKey: '' }),

  setScene: (scene) => set(state => ({
    session: state.session ? { ...state.session, currentScene: scene, currentResult: null } : null
  })),

  setResult: (result) => set(state => ({
    session: state.session ? { ...state.session, currentResult: result } : null
  })),

  setGameState: (gameState) => set(state => ({
    session: state.session ? { ...state.session, gameState } : null
  })),

  applyRoundResult: (choiceMade) => {
    const { session } = get();
    if (!session || !session.currentResult || !session.currentScene) return;

    const validatedResult = validateAndClampResult(session.currentResult, session.players);
    const currentPlayer = session.players[session.currentPlayerIndex];

    // Update player sips
    const updatedPlayers = session.players.map(player => {
      let extraSips = 0;
      for (const drink of validatedResult.drinks) {
        if (
          drink.playerName === player.name ||
          drink.playerName === 'ALL' ||
          (drink.playerName === 'CURRENT' && player.id === currentPlayer.id) ||
          (drink.playerName === 'LEFT' && player.order === (currentPlayer.order + 1) % session.players.length)
        ) {
          extraSips += drink.sips;
        }
      }
      return { ...player, totalSips: player.totalSips + extraSips };
    });

    // Decrement existing rules
    const decrementedRules = session.activeRules
      .map(r => ({ ...r, durationRounds: r.durationRounds - 1 }))
      .filter(r => r.durationRounds > 0);

    // Add new rules
    const newRules: TemporaryRule[] = validatedResult.newRules.map((r, i) => ({
      ...r,
      id: `rule_${Date.now()}_${i}`,
      createdAtRound: session.currentRound,
    }));

    // History entry
    const historyEntry: HistoryEntry = {
      round: session.currentRound,
      playerName: currentPlayer.name,
      sceneText: session.currentScene.sceneText,
      choiceMade,
      resultText: validatedResult.resultText,
    };

    const recentHistory = [...session.recentHistory, historyEntry].slice(-3);

    set(state => ({
      session: state.session ? {
        ...state.session,
        players: updatedPlayers,
        activeRules: [...decrementedRules, ...newRules],
        recentHistory,
        currentResult: validatedResult,
        gameState: 'result',
      } : null
    }));
  },

  advanceToNextTurn: () => {
    const { session } = get();
    if (!session) return;

    const nextPlayerIndex = (session.currentPlayerIndex + 1) % session.players.length;
    const nextRound = nextPlayerIndex === 0 ? session.currentRound + 1 : session.currentRound;

    if (nextRound > session.totalRounds) {
      set(state => ({
        session: state.session ? { ...state.session, gameState: 'finished' } : null
      }));
      return;
    }

    set(state => ({
      session: state.session ? {
        ...state.session,
        currentPlayerIndex: nextPlayerIndex,
        currentRound: nextRound,
        currentScene: null,
        currentResult: null,
        gameState: 'playing',
      } : null,
      loadedSceneKey: '',
    }));
  },

  markSceneLoading: (key: string) => {
    const { loadedSceneKey } = get();
    if (loadedSceneKey === key) return false;
    set({ loadedSceneKey: key });
    return true;
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
