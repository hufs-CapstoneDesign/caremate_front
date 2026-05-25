import { router } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React from "react";
import styled from "styled-components/native";

export default function AddPatientCodeScreen() {
  let code = Math.random().toString(36).substring(2, 5).toUpperCase() + Math.random().toString(36).substring(2, 4).toUpperCase();

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
          <CodeText>{code}</CodeText>
        </CodeCard>
      </Content>

      <BottomArea>
        <NextButton onPress={() => router.replace("/caregiver_main")}>
          <NextText>보호자 홈으로</NextText>
        </NextButton>
      </BottomArea>
    </Container>
  );
}

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