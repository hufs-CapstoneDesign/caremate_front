import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { NotificationBehavior } from "expo-notifications";
import { NotificationHandler } from "expo-notifications";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

// 알림이 왔을 때 디바이스 상단에 배너를 띄울지 말지 결정하는 기본 핸들러 설정
const notificationHandler: NotificationHandler = {
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // 최신 버전에서 요구하는 필수 프로퍼티 추가
    shouldShowBanner: true, 
    shouldShowList: true,
  }),
};

Notifications.setNotificationHandler(notificationHandler);
export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // 1. 앱이 켜져 있는 상태(Foreground)에서 알림을 받았을 때의 처리
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      
      // 서버에서 푸시를 보낼 때 { "type": "AI_CALL" } 데이터를 실어 보낸다고 가정합니다.
      if (data && data.type === "AI_CALL") {
        router.replace("/patient_incoming_call");
      }
    });

    // 2. 사용자가 알림 배너를 클릭해서 앱이 열렸을 때(Background / Killed 상태)의 처리
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && data.type === "AI_CALL") {
        router.replace("/patient_incoming_call");
      }
    });

    // 컴포넌트 언마운트 시 리스너 해제하여 메모리 누수 방지
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />

        <Stack.Screen
          name="patient_incoming_call"
          options={{
            presentation: "fullScreenModal",
            animation: "fade",
          }}
        />

        <Stack.Screen name="patient_call" />
        <Stack.Screen name="patient_main" />
        <Stack.Screen name="explore" />

        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}