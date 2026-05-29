// services/api.js
import * as SecureStore from 'expo-secure-store';

// 백엔드 기본 주소 (본인의 API 주소로 변경하세요)
const BASE_URL = `http://${process.env.EXPO_PUBLIC_API_URL}`; // 예: 'http://localhost:3000'

/**
 * 토큰을 자동으로 첨부하여 백엔드에 요청을 보내는 공통 함수 (GET, POST, PUT, DELETE 모두 지원)
 * @param {string} endpoint - 'api/v1/data' 같은 세부 주소
 * @param {object} payload - 백엔드로 보낼 데이터 객체 (기본값 빈 객체)
 * @param {string} method - HTTP 메서드 지정 (기본값 "POST"로 두어 기존 코드 깨짐 방지)
 */
export async function requestWithToken(endpoint, payload = {}, method = "POST") {
  try {
    // 1. 현재 이 폰에 로그인된 주인이 누구인지 신분증 확인
    const currentRole = await SecureStore.getItemAsync("userRole"); // "GUARDIAN" 또는 "PATIENT"

    // 2. 신분에 맞는 금고 키(Key) 매칭 (수정하신 로그인 정보 그대로 바라봅니다)
    const tokenKey = currentRole === "GUARDIAN" ? "guardianToken" : "patientToken";

    // 3. 진짜 토큰 알갱이 꺼내기
    const activeToken = await SecureStore.getItemAsync(tokenKey);

    // 4. fetch 옵션 객체를 동적으로 생성
    const options = {
      method: method.toUpperCase(), // 소문자로 들어와도 대문자(GET, POST 등)로 안전하게 변환
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeToken}` // 보호자 또는 환자 토큰이 쏙 들어감
      },
    };

    // 🌟 중요: GET 방식은 규격상 body를 담아 보내면 에러를 내뱉는 백엔드가 많으므로,
    // 메서드가 GET이 아니고 페이로드(보낼 데이터)가 존재할 때만 body를 실어 보냅니다.
    if (options.method !== "GET" && payload && Object.keys(payload).length > 0) {
      options.body = JSON.stringify(payload);
    }

    // 5. 백엔드에 요청 쏘기
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);

    // 6. 결과 반환 처리
    if (!response.ok) {
      // 401, 500 등 서버 에러가 났을 때 로그 확인용
      console.error(`[API 에러] ${method} ${endpoint} 상태코드: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API 예외 에러] ${endpoint} 통신 중 에러 발생:`, error);
    throw error;
  }
}