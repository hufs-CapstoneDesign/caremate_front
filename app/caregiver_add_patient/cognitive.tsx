import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";

const COGNITIVE = ["기억력 장애", "지남력 장애", "언어장애", "실행능력 장애", "판단력 장애"];
const BEHAVIORAL = [
  "망상",
  "환각",
  "오인",
  "우울증",
  "불안증세",
  "초조행동",
  "성격변화",
  "수면의 변화",
  "식욕의 변화",
];

export default function AddPatientCognitiveScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSymptom = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    console.log("선택 증상:", selected);
    router.push("/caregiver_add_patient/family");
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
          <ActiveDot />
          <Dot />
          <Dot />
          <Dot />
        </ProgressDots>

        <Spacer />
      </Header>

      <Content>
        <Title>
          나타나고 있는 증상을{"\n"}모두 선택해주세요
        </Title>
        <Sub>해당되는 증상을 모두 체크해주세요. 중복 가능</Sub>

        <SectionTitleWrapper>
          <BlueBar />
          <SectionTitle>인지적 장애 증상</SectionTitle>
        </SectionTitleWrapper>

        <ChipGrid>
          {COGNITIVE.map((item) => (
            <Chip
              key={item}
              selected={selected.includes(item)}
              onPress={() => toggleSymptom(item)}
            >
              <ChipText selected={selected.includes(item)}>{item}</ChipText>
            </Chip>
          ))}
        </ChipGrid>

        <SectionTitleWrapper>
          <PinkBar />
          <SectionTitle>정신행동증상</SectionTitle>
        </SectionTitleWrapper>

        <ChipGrid>
          {BEHAVIORAL.map((item) => (
            <Chip
              key={item}
              selected={selected.includes(item)}
              onPress={() => toggleSymptom(item)}
            >
              <ChipText selected={selected.includes(item)}>{item}</ChipText>
            </Chip>
          ))}
        </ChipGrid>
      </Content>

      <BottomArea>
        <NextButton onPress={handleNext}>
          <NextText>다음으로</NextText>
        </NextButton>
      </BottomArea>
    </Container>
  );
}

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
  margin-bottom: 54px;
`;

const SectionTitleWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 10px;
`;

const BlueBar = styled.View`
  width: 7px;
  height: 34px;
  border-radius: 4px;
  background-color: #4a90e2;
  margin-right: 12px;
`;

const PinkBar = styled.View`
  width: 7px;
  height: 34px;
  border-radius: 4px;
  background-color: #ff4fa3;
  margin-right: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 22px;
  font-weight: 800;
  color: #1a1c1e;
`;

const ChipGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 44px;
`;

const Chip = styled.TouchableOpacity<{ selected: boolean }>`
  width: 48%;
  height: 72px;
  border-radius: 20px;
  background-color: ${(p) => (p.selected ? "#EEF5FF" : "#FFFFFF")};
  border-width: 2px;
  border-color: ${(p) => (p.selected ? "#4A90E2" : "#EEF0F4")};
  justify-content: center;
  align-items: center;
  margin-bottom: 14px;
`;

const ChipText = styled.Text<{ selected: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => (p.selected ? "#4A90E2" : "#6B7280")};
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