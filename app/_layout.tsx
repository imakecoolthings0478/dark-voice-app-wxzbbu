
import { setupErrorLogging } from '../utils/errorLogger';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, SafeAreaView } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';

const STORAGE_KEY = 'natively_error_logs';

export default function RootLayout() {
  useEffect(() => {
    setupErrorLogging();
  }, []);

  const [isReady, setIsReady] = useState(false);
  const params = useGlobalSearchParams();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? insets.top : 0 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
