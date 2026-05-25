import { router } from "expo-router";
import { ChevronLeft, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";

type FamilyMember = {
  name: string;
  relation: string;
};

export default function AddPatientFamilyScreen() {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [familyList, setFamilyList] = useState<FamilyMember[]>([]);

  const handleAddFamily = () => {
    if (!name || !relation) return;

    setFamilyList((prev) => [...prev, { name, relation }]);
    setName("");
    setRelation("");
  };

  const handleRemoveFamily = (index: number) => {
    setFamilyList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    console.log("가족 구성원:", familyList);
    router.push("/caregiver_add_patient/contacts");
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
          <ActiveDot />
          <Dot />
          <Dot />
        </ProgressDots>

        <Spacer />
      </Header>

      <Content>
        <Title>
          함께하는{"\n"}가족 구성원을 알려주세요
        </Title>
        <Sub>환자분을 함께 돌보는 가족들을 적어주세요.</Sub>

        <InputCard>
          <InputRow>
            <InputBox>
              <Label>성함</Label>
              <Input
                placeholder="이름 입력"
                value={name}
                onChangeText={setName}
              />
            </InputBox>

            <InputBox>
              <Label>관계</Label>
              <Input
                placeholder="예: 큰아들"
                value={relation}
                onChangeText={setRelation}
              />
            </InputBox>
          </InputRow>

          <AddButton onPress={handleAddFamily}>
            <Plus size={22} color="#FFFFFF" />
            <AddText>가족 추가</AddText>
          </AddButton>
        </InputCard>

        {familyList.map((item, index) => (
          <FamilyItem key={`${item.name}-${index}`}>
            <FamilyTextBox>
              <FamilyName>{item.name}</FamilyName>
              <FamilyRelation>{item.relation}</FamilyRelation>
            </FamilyTextBox>

            <TouchableOpacity onPress={() => handleRemoveFamily(index)}>
              <X size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </FamilyItem>
        ))}
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
  margin-bottom: 48px;
`;

const InputCard = styled.View`
  border-width: 2px;
  border-style: dashed;
  border-color: #e5e7eb;
  border-radius: 28px;
  padding: 26px;
  background-color: #ffffff;
  margin-bottom: 24px;
`;

const InputRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const InputBox = styled.View`
  width: 48%;
`;

const Label = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: #9ca3af;
  margin-bottom: 8px;
`;

const Input = styled.TextInput`
  height: 64px;
  border-radius: 18px;
  background-color: #ffffff;
  padding: 18px;
  font-size: 17px;
  border-width: 1px;
  border-color: #eef0f4;
`;

const AddButton = styled.TouchableOpacity`
  height: 72px;
  border-radius: 22px;
  background-color: #1a1c1e;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const AddText = styled.Text`
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
  margin-left: 8px;
`;

const FamilyItem = styled.View`
  background-color: #ffffff;
  border-radius: 20px;
  padding: 18px 20px;
  margin-bottom: 12px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const FamilyTextBox = styled.View``;

const FamilyName = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: #1a1c1e;
  margin-bottom: 4px;
`;

const FamilyRelation = styled.Text`
  font-size: 15px;
  color: #6b7280;
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