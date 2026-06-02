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
    const currentRole = await SecureStore.getItemAsync("userRole"); // "CAREGIVER" 또는 "PATIENT"

    // 2. 신분에 맞는 금고 키(Key) 매칭 (수정하신 로그인 정보 그대로 바라봅니다)
    const tokenKey = currentRole === "CAREGIVER" ? "userToken" : "patientToken";

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
    // 🌟 api.js의 options 헤더 조립 직후에 넣어주세요
    console.log("📢 [디버깅] 현재 설정된 유저 역할(Role):", currentRole);
    console.log("📢 [디버깅] 백엔드로 날아가는 Authorization 헤더 진짜 값:", options.headers["Authorization"]);
    // 🌟 중요: GET 방식은 규격상 body를 담아 보내면 에러를 내뱉는 백엔드가 많으므로,
    // 메서드가 GET이 아니고 페이로드(보낼 데이터)가 존재할 때만 body를 실어 보냅니다.
    if (options.method !== "GET" && payload && Object.keys(payload).length > 0) {
      options.body = JSON.stringify(payload);
    }

    // 5. 백엔드에 요청 쏘기
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);

// 6. 결과 반환 처리 (api.js 내부 수정)
    if (!response.ok) {
      console.error(`[API 에러] ${method} ${endpoint} 상태코드: ${response.status}`);
      return await response.json();
    }

    // 🌟 수정된 안전한 반환 처리 부분
    // 1. 서버 응답의 Content-Type 헤더 확인
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      // JSON 형태가 확실하다면 파싱하되, Body가 비어있을 때를 대비해 text를 먼저 읽고 처리합니다.
      const responseText = await response.text();
      return responseText ? JSON.parse(responseText) : {};
    } else {
      // 백엔드가 JSON이 아니라 일반 텍스트나 빈 값을 보낸 경우
      const responseText = await response.text();
      return { message: responseText || "성공 (데이터 없음)" };
    }

  } catch (error) {
    console.error(`[API 예외 에러] ${endpoint} 통신 중 에러 발생:`, error);
    throw error;
  }
}

// 기능별 함수들

//auth

/** 1. 보호자 로그인 */
export async function loginGuardian(loginData) {
  return await requestWithToken("auth/login", loginData);
}

/** 2. 환자 정보 입력 */
export async function invitePatient(patientData) {
  return await requestWithToken("auth/invite-patient", patientData);
}

/** 3. 환자 로그인 (코드입력) */
// ✅ 토큰 없이 그냥 fetch로 직접 보내기
export async function loginPatient(code) {
  const response = await fetch(`${BASE_URL}/auth/login-with-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invitation_code: code }),
  });
  return await response.json();
}

/** 보호자: 환자 정보 조회 */
export async function fetchPatientInfo(patientId) {
  return await requestWithToken(`auth/my-patients`, {}, "GET");
}

/** 환자: 환자 정보 조회 */
export async function fetchPatientInfoForPatient() {
  return await requestWithToken(`auth/me`, {}, "GET");
}

//calls

/** 4. 보호자가 통화 요청하기  */
export async function requestCall() {
  return await requestWithToken("calls/request", {});
}


/** 5. 통화 시작하기 */
export async function startSession(callData) {
  return await requestWithToken("calls", callData);
}

/** 6. 통화 종료하기 */
export async function endSession(sessionId) {
  return await requestWithToken(`calls/${sessionId}`, {});
}

//reports

/** 7. 최근 30일 보고서 조회하기 */
export async function fetchReport() {
  return await requestWithToken(`reports`, {}, "GET");
}

/** 8. 특정 날짜 보고서 조회하기 */
export async function fetchReportByDate(date) {
  return await requestWithToken(`reports/${date}`, {}, "GET");
}

//schedules

/** 9. 일정 조회하기 */
export async function fetchSchedule() {
  return await requestWithToken(`schedules`, {}, "GET");
}

/** 10. 일정 추가하기 */
export async function addSchedule(scheduleData) {
  return await requestWithToken(`schedules`, scheduleData, "PUT");
}

//conversations

/** 11. 대화 내용 조회하기 */
export async function fetchConversation(date) {
  return await requestWithToken(`conversations/${date}`, {}, "GET");
}