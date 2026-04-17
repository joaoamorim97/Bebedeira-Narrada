import 'react-native-gesture-handler';
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

interface State { hasError: boolean; error: string }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: '' };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message + '\n' + (error.stack ?? '').slice(0, 800) };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0D0D1A', padding: 20, justifyContent: 'center' }}>
          <Text style={{ color: 'red', fontSize: 14, marginBottom: 10 }}>Erro:</Text>
          <Text style={{ color: 'white', fontSize: 11 }}>{this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
