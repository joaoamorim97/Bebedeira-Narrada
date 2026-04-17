import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  HowToPlay: undefined;
  Players: { mode?: 'classic' | 'story' } | undefined;
  Config: { players: string[] };
  Game: undefined;
  Result: { choiceMade: string };
  Finale: undefined;
  Costs: undefined;
  StorySetup: { players: string[] };
  StoryLocation: undefined;
  StoryGame: undefined;
  StoryResult: { choiceMade: string };
  StoryFinale: undefined;
};

// Helpers de tipo para usar nas telas
export type ScreenNavigationProp<T extends keyof RootStackParamList> =
  StackNavigationProp<RootStackParamList, T>;

export type ScreenRouteProp<T extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, T>;
