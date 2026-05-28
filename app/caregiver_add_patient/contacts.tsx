import { router } from "expo-router";
import { ChevronLeft, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";
// 🌟 1. Zustand 스토어 훅 임포트
import { useAddPatientStore } from "@/store/addPatientStore";

// 🌟 2. 스토어의 Contact 인터페이스 사양과 일치시킵니다.
type Contact = {
  name: string;
  role: string;
  nickname: string; // 스토어 사양(필수 string)에 맞춰 optional(?) 제거
};

export default function AddPatientContactsScreen() {
  // 🌟 3. 스토어에서 주변인 리스트 저장 함수 가져오기
  const setContacts = useAddPatientStore((state) => state.setContacts);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [nickname, setNickname] = useState("");
  const [contactsList, setContactsList] = useState<Contact[]>([]);

  const handleAddContact = () => {
    if (!name || !role) return;

    setContactsList((prev) => [
      ...prev,
      {
        name,
        role,
        nickname, // 빈 값이어도 빈 문자열("")로 스토어 타입 규격을 충족합니다.
      },
    ]);

    setName("");
    setRole("");
    setNickname("");
  };

  const handleRemoveContact = (index: number) => {
    setContactsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    // 🌟 4. 다음 페이지로 가기 전, 여태까지 누적한 주변인 배열을 전역 스토어에 저장!
    //가족과 마찬가지로 0개 이상이 가능하므로 빈 배열 상태여도 부드럽게 넘어갑니다.
    setContacts(contactsList);

    console.log("주변인 정보 전역 저장 완료:", contactsList);
    router.push("/caregiver_add_patient/medication");
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
          <ActiveDot />
          <Dot />
        </ProgressDots>

        <Spacer />
      </Header>

      <Content>
        <Title>
          가족 외에 교류하는{"\n"}주변 분들이 계신가요?
        </Title>
        <Sub>친구, 이웃, 간병사 등 평소 교류하는 분을 적어주세요.</Sub>

        <InputCard>
          <InputRow>
            <InputBox>
              <Label>성함</Label>
              <Input
                placeholder="이름 입력"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </InputBox>

            <InputBox>
              <Label>역할</Label>
              <Input
                placeholder="예: 친구, 간병인"
                placeholderTextColor="#9CA3AF"
                value={role}
                onChangeText={setRole}
              />
            </InputBox>
          </InputRow>

          <FullInputBox>
            <Label>별명 (선택)</Label>
            <Input
              placeholder="예: 예삐 할머니"
              placeholderTextColor="#9CA3AF"
              value={nickname}
              onChangeText={setNickname}
            />
          </FullInputBox>

          <AddButton onPress={handleAddContact}>
            <Plus size={22} color="#FFFFFF" />
            <AddText>주변인 추가</AddText>
          </AddButton>
        </InputCard>

        {contactsList.map((item, index) => (
          <ContactItem key={`${item.name}-${index}`}>
            <ContactTextBox>
              <ContactName>{item.name}</ContactName>
              <ContactRole>
                {item.role}
                {item.nickname ? ` · ${item.nickname}` : ""}
              </ContactRole>
            </ContactTextBox>

            <TouchableOpacity onPress={() => handleRemoveContact(index)}>
              <X size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </ContactItem>
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

// ==========================================
// 스타일드 컴포넌트는 기존 코드를 완벽히 유지합니다.
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

const FullInputBox = styled.View`
  width: 100%;
  margin-bottom: 24px;
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
  color: #1a1c1e;
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

const ContactItem = styled.View`
  background-color: #ffffff;
  border-radius: 20px;
  padding: 18px 20px;
  margin-bottom: 12px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-width: 1px;
  border-color: #eef0f4;
`;

const ContactTextBox = styled.View``;

const ContactName = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: #1a1c1e;
  margin-bottom: 4px;
`;

const ContactRole = styled.Text`
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