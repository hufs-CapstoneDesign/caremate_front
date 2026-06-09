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
    shouldPlaySound: true,   // 🔊 알림 올 때 소리 켬
    shouldSetBadge: false,   // 🔴 앱 아이콘에 숫자 배지 안 뜸
    shouldShowBanner: true,  // 🔔 앱이 켜져 있을 때도 화면 상단에 팝업(배너) 띄움
    shouldShowList: true,    // 📜 상단 바를 내렸을 때 알림 센터 목록에 남김
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
    // ✅ 1. Foreground: 앱이 켜져 있을 때 푸시 알림 수신
    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage) => {
        console.log("📱 [Foreground] 알림 수신:", remoteMessage);

        const rawRole = await SecureStore.getItemAsync("userRole");
        const userRole = rawRole ? rawRole.toLowerCase() : ""; // 💡 대소문자 방지를 위해 소문자로 통일
        const msgType = remoteMessage.data?.type;

        console.log(`🕵️ [Foreground] 역할 검증 -> userRole: ${userRole}, msgType: ${msgType}`);

        // 역할에 맞지 않는 FCM 무시 (안전하게 소문자로 비교)
        if (userRole === "patient" && msgType !== "AI_CALL") {
          console.log("🛑 환자 역할이지만 AI_CALL이 아니라 거름");
          return;
        }
        if (userRole === "caregiver" && msgType !== "NO_REPLY") {
          console.log("🛑 보호자 역할이지만 NO_REPLY가 아니라 거름");
          return;
        }

        // Expo 로컬 배너 스케줄링
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification?.title ?? "AI 전화",
            body: remoteMessage.notification?.body ?? "전화가 왔습니다.",
            data: remoteMessage.data,
            sound: "default",
          },
          trigger: null,
        });

        // 조건이 일치하면 화면 전환
        if (userRole === "patient" && msgType === "AI_CALL") {
          console.log("🚀 [Foreground] 조건 만족! 화면 전환을 요청합니다.");
          
          // 💡 타이밍 씹힘 방지: setTimeout으로 내비게이션 안정을 확보
          setTimeout(() => {
            router.replace({
              pathname: "/patient_incoming_call",
              params: {
                call_type:
                  typeof remoteMessage.data?.call_type === "string"
                    ? remoteMessage.data.call_type
                    : "requested",
              },
            });
          }, 100);
        }
      },
    );

    // ✅ 2. Background: 앱이 백그라운드에 있을 때 배너 클릭으로 앱 열림
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      async (remoteMessage) => {
        console.log("📂 [Background] 알림 클릭으로 앱 열림:", remoteMessage);
        const rawRole = await SecureStore.getItemAsync("userRole");
        const userRole = rawRole ? rawRole.toLowerCase() : "";
        const data = remoteMessage.data;

        if (userRole === "patient" && data?.type === "AI_CALL") {
          console.log("🚀 [Background] 조건 만족! 화면 전환 실행");
          setTimeout(() => {
            router.replace("/patient_incoming_call");
          }, 200);
        }
      },
    );

    // ✅ 3. Killed: 앱이 완전히 종료된 상태에서 배너 클릭 시
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log("🚀 [Killed] 알림 클릭으로 앱 최초 실행:", remoteMessage);
          const rawRole = await SecureStore.getItemAsync("userRole");
          const userRole = rawRole ? rawRole.toLowerCase() : "";
          const data = remoteMessage.data;

          if (userRole === "patient" && data?.type === "AI_CALL") {
            console.log("🚀 [Killed] 조건 만족! 대기 후 화면 전환 실행");
            setTimeout(() => {
              router.replace("/patient_incoming_call");
            }, 600); // 완전히 꺼진 상태이므로 조금 더 여유 있게 대기
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