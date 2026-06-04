import messaging from "@react-native-firebase/messaging";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { NotificationHandler } from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppRegistry, Platform } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

// 앱이 켜져 있을 때 알림 배너를 어떻게 표시할지 설정
const notificationHandler: NotificationHandler = {
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
};
Notifications.setNotificationHandler(notificationHandler);

// 안드로이드 백그라운드 태스크 중복 등록 방지
if (Platform.OS === "android") {
  const isTaskRegistered =
    AppRegistry.getAppKeys().includes(
      "ReactNativeFirebaseMessagingHeadlessTask",
    ) ||
    (AppRegistry as any).getRunnable?.(
      "ReactNativeFirebaseMessagingHeadlessTask",
    );

  if (!isTaskRegistered) {
    AppRegistry.registerHeadlessTask(
      "ReactNativeFirebaseMessagingHeadlessTask",
      () => require("../index.js"), // index.js 또는 적절한 엔트리 파일 경로
    );
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // 🌟 [수정] 앱 구동 즉시 무조건 FCM 토큰을 발급받아 보내던 전역 로직을 제거했습니다.

    // ✅ 1. Foreground: 앱이 켜져 있을 때 푸시 알림 수신
    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage) => {
        console.log("📱 [Foreground] 알림 수신:", remoteMessage);

        const userRole = await SecureStore.getItemAsync("userRole");
        const msgType = remoteMessage.data?.type;

        // 역할에 맞지 않는 FCM 무시
        if (userRole === "PATIENT" && msgType !== "AI_CALL") return;
        if (userRole === "CAREGIVER" && msgType !== "NO_REPLY") return;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification?.title ?? "AI 전화",
            body: remoteMessage.notification?.body ?? "전화가 왔습니다.",
            data: remoteMessage.data,
            sound: "default",
          },
          trigger: null,
        });

        if (userRole === "PATIENT" && msgType === "AI_CALL") {
          router.replace({
            pathname: "/patient_incoming_call",
            params: {
              call_type:
                typeof remoteMessage.data?.call_type === "string"
                  ? remoteMessage.data.call_type
                  : "requested",
            },
          });
        }
      },
    );

    // ✅ 2. Background: 앱이 백그라운드에 있을 때 배너 클릭으로 앱 열림
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      async (remoteMessage) => {
        console.log("📂 [Background] 알림 클릭으로 앱 열림:", remoteMessage);
        const userRole = await SecureStore.getItemAsync("userRole");
        const data = remoteMessage.data;

        if (userRole === "PATIENT" && data?.type === "AI_CALL") {
          router.replace("/patient_incoming_call");
        }
      },
    );

    // ✅ 3. Killed: 앱이 완전히 종료된 상태에서 배너 클릭 시
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log("🚀 [Killed] 알림 클릭으로 앱 최초 실행:", remoteMessage);
          const userRole = await SecureStore.getItemAsync("userRole");
          const data = remoteMessage.data;

          if (userRole === "PATIENT" && data?.type === "AI_CALL") {
            setTimeout(() => {
              router.replace("/patient_incoming_call");
            }, 500);
          }
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
