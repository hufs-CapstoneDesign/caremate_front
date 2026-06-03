// utils/fcm.ts (예시 공통 함수)
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// 🌟 utils/fcm.ts 파일 내부를 이렇게 고쳐주세요!
export async function registerAndSendFcmToken(
  userToken: string, 
  userType: "CAREGIVER" | "PATIENT" // 👈 이 부분을 추가하여 스트링을 받을 수 있게 만듭니다.
) {
  // FCM 발급 로직...
  
  // 백엔드 보낼 때 body 예시
  const bodyData = {
    fcm_token: "발급받은토큰",
    user_type: userType // 👈 넘겨받은 "CAREGIVER" 또는 "PATIENT"가 서버로 전송됩니다.
  };
  // 2. 백엔드로 쏴주기
  await fetch(`http://${process.env.EXPO_PUBLIC_API_URL}/auth/fcm-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userToken}` // 누가 로그인했는지 헤더에 담기
    },
    body: JSON.stringify(bodyData),
  });
}