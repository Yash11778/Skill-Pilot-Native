import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        }
        persistor={persistor}
      >
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(dashboard)" />
          <Stack.Screen name="setup" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
