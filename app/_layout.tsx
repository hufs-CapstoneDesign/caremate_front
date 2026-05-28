import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native"; 
import * as Device from "expo-device"; 
import * as Notifications from "expo-notifications";
import Constants from 'expo-constants'; // 👈 이 줄을 추가해 주세요!
import { NotificationHandler } from "expo-notifications";
import "react-native-reanimated";

// ⭕ 빨간 줄 에러 오타 교정 완료
import { useColorScheme } from "@/hooks/use-color-scheme";

// 알림이 왔을 때 디바이스 상단에 배너를 띄울지 말지 결정하는 기본 핸들러 설정
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
export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // [FCM 토큰 발급 및 시스템 등록 함수]
    async function registerForPushNotificationsAsync() {
      // 1. 실제 물리 디바이스인지 검증 (에뮬레이터는 푸시 수신 불가)
      if (!Device.isDevice) {
        console.log("⚠️ 알림 알림: 시뮬레이터 환경에서는 FCM 토큰 발급이 제한됩니다.");
        return;
      }

      // 2. 현재 앱의 알림 권한 상태 체크
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 권한이 없다면 사용자에게 팝업 요청
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // 끝내 권한을 거부했다면 종료
      if (finalStatus !== "granted") {
        console.log("❌ 푸시 알림 권한 획득 실패");
        return;
      }

      try {

        const projectId=
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        if (!projectId) {
          console.error("🚨 app.json에서 EAS Project ID를 찾을 수 없습니다. google-services.json 파일이 올바르게 설정되었는지 확인하세요.");
          return;
        }
        // 3. 🌟 요청하신 네이티브 디바이스 푸시 토큰(FCM 구조) 발급 방식으로 교체
        const token = await Notifications.getDevicePushTokenAsync();
        
        console.log("==========================================");
        console.log("🎫 발급 완료된 고유 디바이스 푸시 토큰(FCM):");
        console.log(token.data);
        console.log("==========================================");

        // 🌟 이 위치에서 나중에 백엔드로 토큰을 보내는 API를 호출하시면 됩니다.
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/fcm-token`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fcm_token: token.data })
         })

      } catch (error) {
        console.error("🚨 푸시 토큰 발급 중 에러 발생:", error);
      }

      // 4. 안드로이드 전용 고중요도 알림 채널 강제 할당 (잠금화면/통화 팝업 통과용 필수)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX, // 최우선 순위 설정
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4A90E2",
        });
      }
    }

    // 앱이 로드될 때 푸시 토큰 발급 절차를 시작합니다.
    registerForPushNotificationsAsync();

    // 1. 앱이 켜져 있는 상태(Foreground)에서 알림을 받았을 때의 처리
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log("🔔 [포그라운드] 알림 수신 성공!!!", notification);
      const data = notification.request.content.data;
      console.log("📦 수신된 데이터 Payload:", data);
      
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
      {/* ⭕ 오타 기호(\)가 제거된 깔끔한 스택 설정 구조 */}
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