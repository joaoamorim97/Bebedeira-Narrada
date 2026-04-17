import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from './types';
import { COLORS } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import HowToPlayScreen from '../screens/HowToPlayScreen';
import PlayersScreen from '../screens/PlayersScreen';
import ConfigScreen from '../screens/ConfigScreen';
import GameScreen from '../screens/GameScreen';
import ResultScreen from '../screens/ResultScreen';
import FinaleScreen from '../screens/FinaleScreen';
import CostsScreen from '../screens/CostsScreen';
import StorySetupScreen from '../screens/StorySetupScreen';
import StoryLocationScreen from '../screens/StoryLocationScreen';
import StoryGameScreen from '../screens/StoryGameScreen';
import StoryResultScreen from '../screens/StoryResultScreen';
import StoryFinaleScreen from '../screens/StoryFinaleScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
          <Stack.Screen name="Players" component={PlayersScreen} />
          <Stack.Screen name="Config" component={ConfigScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Finale" component={FinaleScreen} />
          <Stack.Screen name="Costs" component={CostsScreen} />
          <Stack.Screen name="StorySetup" component={StorySetupScreen} />
          <Stack.Screen name="StoryLocation" component={StoryLocationScreen} />
          <Stack.Screen name="StoryGame" component={StoryGameScreen} />
          <Stack.Screen name="StoryResult" component={StoryResultScreen} />
          <Stack.Screen name="StoryFinale" component={StoryFinaleScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
