// utils/fcm.ts (예시 공통 함수)
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// 🌟 utils/fcm.ts 파일 내부를 이렇게 고쳐주세요!
export async function registerAndSendFcmToken(
  userToken: string,
  userType: "CAREGIVER" | "PATIENT"
) {
  if (!Device.isDevice) {
    console.warn("FCM 토큰은 실제 기기에서만 발급됩니다.");
    return;
  }

  // 1. 알림 권한 요청
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("알림 권한이 거부되었습니다.");
    return;
  }

  // 2. FCM 디바이스 토큰 발급
  const tokenData = await Notifications.getDevicePushTokenAsync();
  const fcmToken = tokenData.data;
  console.log("📲 FCM 디바이스 토큰 발급 완료:", fcmToken);

  // 3. 백엔드로 전송
  const bodyData = {
    fcm_token: fcmToken,
    user_type: userType,
  };

  await fetch(`http://${process.env.EXPO_PUBLIC_API_URL}/auth/fcm-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userToken}`,
    },
    body: JSON.stringify(bodyData),
  });

  console.log("✅ FCM 토큰 서버 전송 완료");
}