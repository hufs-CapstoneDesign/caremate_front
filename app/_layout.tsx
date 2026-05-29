import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, AppRegistry } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { NotificationHandler } from "expo-notifications";
import "react-native-reanimated";
import messaging from "@react-native-firebase/messaging"; // 🌟 FCM 임포트

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
      "ReactNativeFirebaseMessagingHeadlessTask"
    ) ||
    (AppRegistry as any).getRunnable?.(
      "ReactNativeFirebaseMessagingHeadlessTask"
    );

  if (!isTaskRegistered) {
    try {
      AppRegistry.registerHeadlessTask(
        "ReactNativeFirebaseMessagingHeadlessTask",
        () => {
          return async (remoteMessage: any) => {
            console.log(
              "📦 [HeadlessTask] 백그라운드 푸시 태스크 완료",
              remoteMessage
            );
            return Promise.resolve();
          };
        }
      );
    } catch (e) {
      console.log("💡 HeadlessTask가 이미 등록되어 있어 생략합니다.");
    }
  }
}

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // FCM 토큰 발급 및 알림 권한 요청
    async function registerForPushNotificationsAsync() {
      if (!Device.isDevice) {
        console.log("⚠️ 시뮬레이터 환경에서는 FCM 토큰 발급이 제한됩니다.");
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("❌ 푸시 알림 권한 획득 실패");
        return;
      }

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        if (!projectId) {
          console.error("🚨 EAS Project ID를 찾을 수 없습니다.");
          return;
        }

        const token = await Notifications.getDevicePushTokenAsync();
        
        console.log("==========================================");
        console.log("🎫 발급 완료된 고유 디바이스 푸시 토큰(FCM):");
        console.log(token.data);
        console.log("==========================================");

        // 🌟 이 위치에서 나중에 백엔드로 토큰을 보내는 API를 호출하시면 됩니다.
        await fetch(`http://${process.env.EXPO_PUBLIC_API_URL}/auth/fcm-token`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fcm_token: token.data })
         });

        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/fcm-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcm_token: token.data }),
        });
      } catch (error) {
        console.error("🚨 푸시 토큰 발급 중 에러:", error);
      }

      // 안드로이드 알림 채널 설정 (8.0 이상 필수)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4A90E2",
        });
      }
    }

    registerForPushNotificationsAsync();

    // ✅ 1. 포그라운드: 앱이 켜져 있을 때 FCM 메시지 수신
    // 혼합형 메시지는 포그라운드에서 배너를 자동으로 안 띄워줘서
    // FCM으로 받은 뒤 expo-notifications로 직접 배너를 생성합니다.
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log("🔔 [포그라운드] FCM 메시지 수신:", remoteMessage);
      const data = remoteMessage.data;

      // AI_CALL이면 배너 없이 바로 화면 이동
      if (data?.type === "AI_CALL") {
        router.replace("/patient_incoming_call");
        return;
      }

      // 일반 알림은 로컬 배너로 직접 띄우기
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title ?? "알림",
          body: remoteMessage.notification?.body ?? "",
          data: data ?? {},
        },
        trigger: null, // null = 즉시 표시
      });
    });

    // ✅ 2. 백그라운드: 홈화면 등에서 배너 클릭 시
    // OS가 배너를 띄워주고, 클릭하면 이 리스너가 실행됩니다.
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        console.log("📲 [백그라운드] 알림 클릭으로 앱 열림:", remoteMessage);
        const data = remoteMessage.data;
        if (data?.type === "AI_CALL") {
          router.replace("/patient_incoming_call");
        }
      }
    );

    // ✅ 3. Killed: 앱이 완전히 종료된 상태에서 배너 클릭 시
    // onNotificationOpenedApp은 동작 안 하고, getInitialNotification으로
    // "이 알림 때문에 앱이 켜졌구나"를 감지합니다.
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("🚀 [Killed] 알림 클릭으로 앱 최초 실행:", remoteMessage);
          const data = remoteMessage.data;
          if (data?.type === "AI_CALL") {
            // 앱이 막 켜진 직후라 router가 준비되기까지 약간 지연
            setTimeout(() => {
              router.replace("/patient_incoming_call");
            }, 500);
          }
        }
      });

    // 컴포넌트 언마운트 시 리스너 해제 (메모리 누수 방지)
    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
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
        <Stack.Screen name="caregiver_main" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
