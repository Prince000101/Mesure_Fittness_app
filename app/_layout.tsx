import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';

SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = 'onboarding_complete';

function StatusBarWrapper() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

function RootLayoutContent() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const onboarded = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (onboarded !== 'true') {
          router.replace('/onboarding');
        }
      } catch {
        router.replace('/onboarding');
      }
      setReady(true);
      await SplashScreen.hideAsync();
    }
    init();
  }, []);

  if (!ready) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="workout-session" options={{ presentation: 'modal' }} />
        <Stack.Screen name="exercise-library" />
        <Stack.Screen name="create-workout-routine" />
        <Stack.Screen name="workout-details" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBarWrapper />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <WorkoutProvider>
        <RootLayoutContent />
      </WorkoutProvider>
    </ThemeProvider>
  );
}
