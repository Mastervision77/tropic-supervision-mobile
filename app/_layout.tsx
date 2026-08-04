import { Cairo_700Bold } from "@expo-google-fonts/cairo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { I18nManager } from "react-native";
import "react-native-reanimated";
import "../localization/i18n";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/useNotifications";
import { useMutate } from "@/hooks/useMutate";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FFFFFF",
  },
};

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#FFFFFF",
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInitializer() {
  const { token } = useAuth();
  const { registerForPushNotifications } = useNotifications();
  const hasRegistered = useRef(false);

  const { mutate: registerDeviceToken } = useMutate({
    endpoint: "device-tokens",
    mutationKey: ["device-tokens"],
    onSuccess: (data) => {
      console.log("Push token registered successfully!", data);
    },
    onError: (err) => {
      console.error("Push token error:", err);
      hasRegistered.current = false; 
    },
  });

  useEffect(() => {
    if (!token || hasRegistered.current) return;

    const register = async () => {
      hasRegistered.current = true;

      const fcmToken = await registerForPushNotifications();
      console.log("FCM Token:", fcmToken);

      if (!fcmToken) {
        hasRegistered.current = false;
        return;
      }

      registerDeviceToken({
        token: fcmToken,
        platform: "android",
        device_name: "My Android Phone",
      });
    };

    register();
  }, [token]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Cairo_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);



  // 👈 الـ return المبكر بعد كل الـ Hooks
  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInitializer />
        <ThemeProvider
          value={colorScheme === "dark" ? customDarkTheme : customLightTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}