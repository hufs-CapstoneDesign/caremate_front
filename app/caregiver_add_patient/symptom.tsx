import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";
// 🌟 1. Zustand 스토어 훅 임포트
import { useAddPatientStore } from "@/store/addPatientStore";

// 🌟 2. 스토어에 정의된 타입과 안전하게 싱크 맞추기
type SeverityStage = "경증" | "중등도" | "중증" | "";

const LEVELS = [
  {
    value: "경증",
    title: "경증",
    description: "일상생활은 가능하나 기억력이 저하된 상태",
  },
  {
    value: "중등도",
    title: "중등도",
    description: "도움 없이는 일상생활이 다소 어려운 상태",
  },
  {
    value: "중증",
    title: "중증",
    description: "지속적인 돌봄과 관찰이 꼭 필요한 상태",
  },
] as const;

export default function AddPatientSymptomScreen() {
  // 🌟 3. 스토어에서 중증도 저장 함수 가져오기
  const setSeverityInfo = useAddPatientStore((state) => state.setSeverityInfo);
  
  // 타입 안정성 보강
  const [level, setLevel] = useState<SeverityStage>("");

  const handleNext = () => {
    if (!level) return;

    // 🌟 4. 다음 페이지로 가기 전 전역 스토어에 선택된 중증도 저장!
    setSeverityInfo(level);

    // 🌟 5. 다음 라우트로 이동 (질문하셨던 흐름대로 이동)
    console.log("증상 정보 전역 저장 완료:", level);
    router.push("/caregiver_add_patient/cognitive");
  };

  return (
    <Container>
      <Header>
        <TouchableOpacity onPress={() => router.back()}>
          <BackCircle>
            <ChevronLeft size={24} color="#6B7280" />
          </BackCircle>
        </TouchableOpacity>

        <ProgressDots>
          <Dot />
          <ActiveDot />
          <Dot />
          <Dot />
          <Dot />
          <Dot />
        </ProgressDots>

        <Spacer />
      </Header>

      <Content>
        <Title>
          현재 증상의 정도는{"\n"}어느 정도인가요?
        </Title>

        <Sub>객관적인 상태에 가장 가까운 것을 선택해주세요.</Sub>

        <CardList>
          {LEVELS.map((item) => (
            <LevelCard
              key={item.value}
              selected={level === item.value}
              onPress={() => setLevel(item.value)}
              activeOpacity={0.8}
            >
              <TextGroup>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </TextGroup>

              <Radio selected={level === item.value}>
                {level === item.value && <RadioInner />}
              </Radio>
            </LevelCard>
          ))}
        </CardList>
      </Content>

      <BottomArea>
        <NextButton disabled={!level} onPress={handleNext} selected={!!level}>
          <NextText>다음으로</NextText>
        </NextButton>
      </BottomArea>
    </Container>
  );
}

// ==========================================
// 스타일드 컴포넌트 구조는 기존 코드를 유지합니다.
// ==========================================
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f8f9fb;
`;

const Header = styled.View`
  padding: 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BackCircle = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: #f3f4f6;
  justify-content: center;
  align-items: center;
`;

const Spacer = styled.View`
  width: 44px;
`;

const ProgressDots = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #e5e7eb;
`;

const ActiveDot = styled.View`
  width: 36px;
  height: 10px;
  border-radius: 8px;
  background-color: #4a90e2;
`;

const Content = styled.ScrollView`
  padding: 32px 28px 20px 28px;
`;

const Title = styled.Text`
  font-size: 36px;
  font-weight: 800;
  color: #1a1c1e;
  line-height: 46px;
`;

const Sub = styled.Text`
  margin-top: 18px;
  font-size: 18px;
  color: #6b7280;
  line-height: 28px;
`;

const CardList = styled.View`
  margin-top: 56px;
`;

const LevelCard = styled.TouchableOpacity<{ selected: boolean }>`
  min-height: 138px;
  border-radius: 28px;
  background-color: #ffffff;
  border-width: 2px;
  border-color: ${(props) => (props.selected ? "#4A90E2" : "#EEF0F4")};
  padding: 28px 26px;
  margin-bottom: 22px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TextGroup = styled.View`
  flex: 1;
  padding-right: 18px;
`;

const CardTitle = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: #1a1c1e;
  margin-bottom: 12px;
`;

const CardDescription = styled.Text`
  font-size: 17px;
  color: #4b5563;
  line-height: 26px;
`;

const Radio = styled.View<{ selected: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  border-width: 3px;
  border-color: ${(props) => (props.selected ? "#4A90E2" : "#E5E7EB")};
  justify-content: center;
  align-items: center;
`;

const RadioInner = styled.View`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #4a90e2;
`;

const BottomArea = styled.View`
  padding: 18px 28px 34px 28px;
  background-color: #f8f9fb;
`;

const NextButton = styled.TouchableOpacity<{ selected: boolean }>`
  height: 72px;
  border-radius: 24px;
  background-color: ${(props) => (props.selected ? "#4A90E2" : "#CBD5E1")};
  justify-content: center;
  align-items: center;
`;

const NextText = styled.Text`
  color: white;
  font-size: 20px;
  font-weight: 800;
`;