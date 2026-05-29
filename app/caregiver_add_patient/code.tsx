import { router } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import { useAddPatientStore } from "@/store/addPatientStore";
import * as SecureStore from "expo-secure-store";

export default function AddPatientCodeScreen() {
  const resetStore = useAddPatientStore((state) => state.reset);
  const allData = useAddPatientStore((state) => state);

  // 백엔드로부터 응답받을 코드를 저장할 상태 (초기값은 비워둡니다)
  const [finalCode, setFinalCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 백엔드 규격에 맞는 Nested JSON 구조 일괄 전송 및 코드 발급 함수
  const handleFetchCodeAndSubmit = async () => {
    // 이미 코드를 성공적으로 받았거나 요청 중이면 중복 실행 방지
    if (finalCode) {
      handleGoToMain();
      return;
    }
    
    setIsSubmitting(true);

    // 백엔드가 요청한 "basic_info" 중첩 구조로 데이터 패킹
    const finalPayload = {
      basic_info: {
        name: allData.name,
        age: Number(allData.age) || 0,           
        guardian_relationship: allData.relation, 
        patient_status: allData.severity,        
        symptoms: allData.symptoms,              
      },
      familyMembers: allData.familyMembers,
      contacts: allData.contacts,
      medication: allData.medication,
      // 💡 코드는 백엔드가 생성하므로 페이로드에서는 제외하거나 빈 값 처리
    };

    console.log("================ [백엔드 요청 규격 JSON 페이로드] ================");
    console.log(JSON.stringify(finalPayload, null, 2));
    console.log("==========================================================");

    try {
      // 🔒 저장소에서 보호자의 JWT 토큰 꺼내기
      const guardianToken = await SecureStore.getItemAsync("userToken");

      const API_URL = `http://${process.env.EXPO_PUBLIC_API_URL}/auth/invite-patient`; 

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${guardianToken}`
        },
        body: JSON.stringify(finalPayload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("================ [백엔드 응답 데이터 수신] ================");
        console.log(JSON.stringify(data, null, 2));
        console.log("==========================================================");

        // 백엔드가 내려준 응답 객체에서 code 필드 추출 (예: data.code 혹은 data.invite_code)
        // 💡 백엔드 키값 명세 규격에 맞게 'data.code' 부분을 수정하시면 됩니다.
        const serverGeneratedCode = data.code; 

        if (serverGeneratedCode) {
          setFinalCode(serverGeneratedCode); // 받아온 세션 코드를 카드의 텍스트로 박아줌
          console.log(`✅ 백엔드 발급 코드 반영 완료: ${serverGeneratedCode}`);
        } else {
          Alert.alert("확인", "환자 정보는 저장되었으나 발급된 코드를 확인할 수 없습니다.");
        }
      } else {
        Alert.alert("등록 실패", data.detail || "서버 저장 도중 문제가 발생했습니다.");
      }
    } catch (error) {
      console.error("🚨 네트워크 에러 발생:", error);
      Alert.alert("네트워크 오류", "서버와 통신할 수 없습니다. 백엔드 서버 상태를 확인하세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🧹 메인 화면으로 이동 시 주스탠드 상태 가방 비우기 분리 함수
  const handleGoToMain = () => {
    resetStore(); // 가방 완전히 비우기
    router.replace("/caregiver_main"); // 보호자 메인 홈으로 이동
  };

  return (
    <Container>
      <Content>
        <IconCircle>
          <CheckCircle size={56} color="#4A90E2" />
        </IconCircle>

        <Title>{finalCode ? "연결 코드 발급 완료!" : "환자 정보 전송하기"}</Title>

        <Sub>
          {finalCode 
            ? `환자분 계정에서 아래 코드를 입력하면\n보호자 계정과 최종 연결됩니다.`
            : `작성하신 환자 기본 정보 및 복약 정보를\n서버에 안전하게 등록합니다.`}
        </Sub>

        <CodeCard style={{ opacity: finalCode ? 1 : 0.4 }}>
          <CodeLabel>연결 코드</CodeLabel>
          <CodeText>{finalCode || "발급 대기 중"}</CodeText>
        </CodeCard>
      </Content>

      <BottomArea>
        {/* 코드가 발급되기 전에는 [코드 발급 및 전송], 발급된 후에는 [보호자 홈으로] 텍스트 전환 */}
        <NextButton onPress={finalCode ? handleGoToMain : handleFetchCodeAndSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <NextText>{finalCode ? "보호자 홈으로" : "환자 등록 및 코드 받기"}</NextText>
          )}
        </NextButton>
      </BottomArea>
    </Container>
  );
}

// ==========================================
// ✨ 스타일드 컴포넌트 의상실 (UI 100% 동일 유지)
// ==========================================
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f8f9fb;
`;

const Content = styled.View`
  flex: 1;
  padding: 60px 28px 20px 28px;
  justify-content: center;
  align-items: center;
`;

const IconCircle = styled.View`
  width: 112px;
  height: 112px;
  border-radius: 56px;
  background-color: #eef5ff;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: 800;
  color: #1a1c1e;
  text-align: center;
  margin-bottom: 18px;
`;

const Sub = styled.Text`
  font-size: 17px;
  color: #6b7280;
  line-height: 27px;
  text-align: center;
  margin-bottom: 46px;
`;

const CodeCard = styled.View`
  width: 100%;
  background-color: #ffffff;
  border-radius: 28px;
  padding: 30px 24px;
  align-items: center;
  border-width: 2px;
  border-color: #eef0f4;
`;

const CodeLabel = styled.Text`
  font-size: 15px;
  color: #9ca3af;
  font-weight: 700;
  margin-bottom: 14px;
`;

const CodeText = styled.Text`
  font-size: 30px;
  font-weight: 900;
  color: #4a90e2;
  letter-spacing: 2px;
`;

const BottomArea = styled.View`
  padding: 18px 28px 34px 28px;
  background-color: #f8f9fb;
`;

const NextButton = styled.TouchableOpacity`
  height: 72px;
  border-radius: 24px;
  background-color: #4a90e2;
  justify-content: center;
  align-items: center;
`;

const NextText = styled.Text`
  color: white;
  font-size: 20px;
  font-weight: 800;
`;