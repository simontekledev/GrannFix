import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, useColorScheme as useSystemColorScheme } from 'react-native';
import { Asset } from 'expo-asset';
import Animated, { FadeOut } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserProvider } from '@/src/context/UserContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/src/context/ThemeContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { UnreadChatProvider } from '@/src/context/UnreadChatContext';
import { BlockedUsersProvider } from '@/src/context/BlockedUsersContext';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';

function ThemedStatusBar() {
  const { mode } = useTheme();
  return <StatusBar style={mode === "dark" ? "light" : "dark"} />;
}

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const systemScheme = useSystemColorScheme();
  const [appReady, setAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  usePushNotifications();

  useEffect(() => {
    async function prepare() {
      await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 1200)),
        Asset.loadAsync([
          require("@/assets/images/pen-icon.png"),
          require("@/assets/images/keylock-icon.png"),
          require("@/assets/images/blocked-user-icon.png"),
          require("@/assets/images/notification-icon.png"),
          require("@/assets/images/info-icon.png"),
          require("@/assets/images/theme-icon.png"),
          require("@/assets/images/settings-icon- black-transparent.png"),
          require("@/assets/images/chat-tab-icon.png"),
          require("@/assets/images/explore-icon.png"),
          require("@/assets/images/activity-icon.png"),
          require("@/assets/images/profile-icon.png"),
          require("@/assets/images/user-profile1-icon.png"),
          require("@/assets/images/verified-icon.png"),
          require("@/assets/images/search-icon.png"),
          require("@/assets/images/location-icon-transparent.png"),
          require("@/assets/images/chat-icon.png"),
          require("@/assets/images/empty-inbox-icon.png"),
          require("@/assets/images/camera-icon.png"),
          require("@/assets/images/grannfix-primary-transparent-logo.png"),
          require("@/assets/images/grannfix-primary-transparent-logo-dark.png"),
          require("@/assets/images/grannfix-wordmark-transparent.png"),
          require("@/assets/images/grannfix-wordmark-transparent-dark.png"),
        ]),
      ]);
      await SplashScreen.hideAsync();
      setAppReady(true);
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      const timer = setTimeout(() => setShowSplash(false), 500);
      return () => clearTimeout(timer);
    }
  }, [appReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <ErrorBoundary>
    <AppThemeProvider>
    <UserProvider>
    <UnreadChatProvider>
    <BlockedUsersProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {appReady && (
        <>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ headerShown: false }} />
            <Stack.Screen name="terms" options={{ headerShown: false }} />
            <Stack.Screen name="privacy" options={{ headerShown: false }} />
            <Stack.Screen name="change-password" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
            <Stack.Screen name="task-detail" options={{ headerShown: false }} />
            <Stack.Screen name="public-user" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="chat-conversation" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="blocked-users" options={{ headerShown: false }} />
            <Stack.Screen name="user-reviews" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="reset-password" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <ThemedStatusBar />
        </>
      )}
      {showSplash && (
        <Animated.View
          style={[
            styles.splash,
            { backgroundColor: systemScheme === 'dark' ? '#0f1411' : '#f5faf2' },
          ]}
          exiting={FadeOut.duration(400)}
        >
          <Image
            source={require('@/assets/images/grannfix-icon - transparent.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </ThemeProvider>
    </BlockedUsersProvider>
    </UnreadChatProvider>
    </UserProvider>
    </AppThemeProvider>
    </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  splashLogo: {
    width: 220,
    height: 220,
  },
});
