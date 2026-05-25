import { router } from "expo-router";
import { Check, ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";
// Zustand 스토어 훅 임포트
import { useAddPatientStore } from "@/store/addPatientStore";

type Medication = "하루 1회" | "하루 2회" | "하루 3회" | "하루 4회 이상" | "기타" | "";

const MEDICATION_OPTIONS = [
  { value: "하루 1회", title: "하루 1회", description: "주로 아침에 한 번" },
  { value: "하루 2회", title: "하루 2회", description: "아침과 저녁" },
  { value: "하루 3회", title: "하루 3회", description: "아침, 점심, 저녁" },
  { value: "하루 4회 이상", title: "하루 4회 이상", description: "매끼 및 취침 전" },
  { value: "기타", title: "기타", description: "정해진 시간 없이 복용" },
] as const;

export default function AddPatientMedicationScreen() {
  const setMedication = useAddPatientStore((state) => state.setMedication);
  const [medicationCount, setMedicationCount] = useState<Medication>("");

  // 🌟 변경: 서버 전송을 하지 않고, 스토어 보관 후 바로 코드 페이지로 라우팅합니다.
  const handleNext = () => {
    if (!medicationCount) return;

    // 현재 화면의 복약 정보 스토어 동기화
    setMedication(medicationCount);

    // 코드 발급 페이지로 이동
    router.push("/caregiver_add_patient/code");
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
          <Dot />
          <Dot />
          <Dot />
          <Dot />
          <ActiveDot />
        </ProgressDots>

        <Spacer />
      </Header>

      <Content>
        <Title>하루에 약을{"\n"}몇 회 챙겨드시나요?</Title>
        <Sub>안부 전화 시 복약 여부를 꼼꼼히 체크해드립니다.</Sub>

        <OptionList>
          {MEDICATION_OPTIONS.map((item) => {
            const selected = medicationCount === item.value;
            return (
              <OptionCard
                key={item.value}
                selected={selected}
                onPress={() => setMedicationCount(item.value)}
                activeOpacity={0.85}
              >
                <TextGroup>
                  <OptionTitle selected={selected}>{item.title}</OptionTitle>
                  <OptionDescription>{item.description}</OptionDescription>
                </TextGroup>

                <Radio selected={selected}>
                  {selected && <Check size={22} color="#FFFFFF" />}
                </Radio>
              </OptionCard>
            );
          })}
        </OptionList>
      </Content>

      <BottomArea>
        <NextButton
          selected={!!medicationCount}
          disabled={!medicationCount}
          onPress={handleNext}
        >
          <NextText>다음으로</NextText>
        </NextButton>
      </BottomArea>
    </Container>
  );
}

// 스타일드 컴포넌트는 기존 UI 레이아웃 사양을 100% 보존합니다.
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
  font-size: 34px;
  font-weight: 800;
  color: #1a1c1e;
  line-height: 44px;
`;
const Sub = styled.Text`
  margin-top: 18px;
  font-size: 17px;
  color: #6b7280;
  line-height: 26px;
  margin-bottom: 44px;
`;
const OptionList = styled.View`
  margin-bottom: 120px;
`;
const OptionCard = styled.TouchableOpacity<{ selected: boolean }>`
  min-height: 118px;
  border-radius: 28px;
  background-color: ${(p) => (p.selected ? "#F3F6FF" : "#FFFFFF")};
  border-width: 2px;
  border-color: ${(p) => (p.selected ? "#4A90E2" : "#EEF0F4")};
  padding: 26px;
  margin-bottom: 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const TextGroup = styled.View`
  flex: 1;
  padding-right: 18px;
`;
const OptionTitle = styled.Text<{ selected: boolean }>`
  font-size: 24px;
  font-weight: 800;
  color: ${(p) => (p.selected ? "#4A90E2" : "#1A1C1E")};
  margin-bottom: 10px;
`;
const OptionDescription = styled.Text`
  font-size: 17px;
  color: #6b7280;
  line-height: 25px;
`;
const Radio = styled.View<{ selected: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 21px;
  border-width: 3px;
  border-color: ${(p) => (p.selected ? "#4A90E2" : "#E5E7EB")};
  background-color: ${(p) => (p.selected ? "#4A90E2" : "#FFFFFF")};
  justify-content: center;
  align-items: center;
`;
const BottomArea = styled.View`
  padding: 18px 28px 34px 28px;
  background-color: #f8f9fb;
`;
const NextButton = styled.TouchableOpacity<{ selected: boolean }>`
  height: 72px;
  border-radius: 24px;
  background-color: ${(p) => (p.selected ? "#4A90E2" : "#CBD5E1")};
  justify-content: center;
  align-items: center;
`;
const NextText = styled.Text`
  color: white;
  font-size: 20px;
  font-weight: 800;
`;