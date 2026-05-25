import { router } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
// ActivityIndicator를 react-native 순정으로 가져와 에러를 방지합니다.
import { Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import { useAddPatientStore } from "@/store/addPatientStore";
const PATIENT_ID = "6d3ef730-2ac9-4290-8db2-31859bcc49a5"; 

const API_URL = `http://${process.env.EXPO_PUBLIC_API_URL}/${PATIENT_ID}/profile`;

export default function AddPatientCodeScreen() {
  const setCode = useAddPatientStore((state) => state.setCode);
  const resetStore = useAddPatientStore((state) => state.reset);
  const allData = useAddPatientStore((state) => state);

  const [finalCode, setFinalCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 화면 진입 시 5자리 대문자 조합 코드 발행 및 스토어 동기화
  useEffect(() => {
    const generatedCode = 
      Math.random().toString(36).substring(2, 5).toUpperCase() + 
      Math.random().toString(36).substring(2, 4).toUpperCase();
    
    setFinalCode(generatedCode);
    setCode(generatedCode);
  }, []);

  // 백엔드 규격에 맞는 Nested JSON 구조 일괄 전송 함수
  const handleFinalSubmit = async () => {
    if (!finalCode || isSubmitting) return;
    setIsSubmitting(true);

    // 백엔드가 요청한 "basic_info" 중첩 구조로 직조
    const finalPayload = {
      basic_info: {
        name: allData.name,
        age: Number(allData.age) || 0,           // 나이를 숫자로 변환
        guardian_relationship: allData.relation, // 보호자 관계
        patient_status: allData.severity,        // 환자 상태(중증도)
        symptoms: allData.symptoms,              // 선택된 증상 리스트 배열
      },
      familyMembers: allData.familyMembers,
      contacts: allData.contacts,
      medication: allData.medication,
      code: finalCode, 
    };

    console.log("================ [백엔드 요청 규격 JSON 페이로드] ================");
    console.log(JSON.stringify(finalPayload, null, 2));
    console.log("==========================================================");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPayload),
      });

      if (response.ok) {
        console.log("환자 정보 일괄 전송 성공!");
        resetStore(); // 가방 완전히 비우기
        router.replace("/caregiver_main"); // 메인으로 이동
      } else {
        Alert.alert("등록 실패", "서버 저장 도중 문제가 발생했습니다.");
      }
    } catch (error) {
      console.error("네트워크 에러 발생:", error);
      Alert.alert("네트워크 오류", "서버와 통신할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Content>
        <IconCircle>
          <CheckCircle size={56} color="#4A90E2" />
        </IconCircle>

        <Title>연결 코드 발급 완료!</Title>

        <Sub>
          환자분 계정에서 코드를 입력하면{"\n"}
          보호자 계정과 연결됩니다.
        </Sub>

        <CodeCard>
          <CodeLabel>연결 코드</CodeLabel>
          <CodeText>{finalCode || "생성 중..."}</CodeText>
        </CodeCard>
      </Content>

      <BottomArea>
        <NextButton onPress={handleFinalSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <NextText>보호자 홈으로</NextText>
          )}
        </NextButton>
      </BottomArea>
    </Container>
  );
}

// ==========================================
// ✨ 스타일드 컴포넌트 최종 완성 코드
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