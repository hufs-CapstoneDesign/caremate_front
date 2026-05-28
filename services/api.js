// services/api.js
import * as SecureStore from 'expo-secure-store';

// 백엔드 기본 주소 (본인의 API 주소로 변경하세요)
const BASE_URL = 'http://${process.env.EXPO_PUBLIC_API_URL}'; // 예: 'http://

/**
 * 토큰을 자동으로 첨부하여 백엔드에 POST 요청을 보내는 공통 함수
 * @param {string} endpoint - 'api/v1/data' 같은 세부 주소
 * @param {object} payload - 백엔드로 보낼 데이터 객체
 */
export async function requestWithToken(endpoint, payload) {
  try {
    // 1. 현재 이 폰에 로그인된 주인이 누구인지 신분증 확인
    const currentRole = await SecureStore.getItemAsync("userRole"); // "GUARDIAN" 또는 "PATIENT"

    // 2. 신분에 맞는 금고 키(Key) 매칭
    const tokenKey = currentRole === "GUARDIAN" ? "guardianToken" : "patientToken";

    // 3. 진짜 토큰 알갱이 꺼내기
    const activeToken = await SecureStore.getItemAsync(tokenKey);

    // 4. 백엔드에 요청 쏘기
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeToken}` // 보호자 또는 환자 토큰이 쏙 들어감
      },
      body: JSON.stringify(payload),
    });

    // response 결과를 바로 JSON으로 파싱해서 리턴해주면 쓰기 편합니다.
    return await response.json();
    
  } catch (error) {
    console.error("API 요청 중 에러 발생:", error);
    throw error;
  }
}