import { router } from "expo-router";
import { ChevronLeft, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";
// 🌟 1. Zustand 스토어 훅 임포트
import { useAddPatientStore } from "@/store/addPatientStore";

// 🌟 2. 스토어에 정의된 타입과 완벽하게 싱크를 맞춥니다.
type Relation = "자녀" | "배우자" | "손주/손녀" | "형제/자매" | "기타" | "";

type FamilyMember = {
  name: string;
  relation: Relation; // string 대신 정확한 관계 타입 적용
};

export default function AddPatientFamilyScreen() {
  // 🌟 3. 스토어에서 가족 리스트 저장 함수 가져오기
  const setFamilyMembers = useAddPatientStore((state) => state.setFamilyMembers);

  const [name, setName] = useState("");
  const [relation, setRelation] = useState<Relation>("");
  const [familyList, setFamilyList] = useState<FamilyMember[]>([]);

  const handleAddFamily = () => {
    if (!name || !relation) return;

    // 스토어 타입(Relation) 조건에 맞는지 한 번 더 체크 후 추가
    setFamilyList((prev) => [...prev, { name, relation }]);
    setName("");
    setRelation("");
  };

  const handleRemoveFamily = (index: number) => {
    familyList.splice(index, 1);
    // 상태 변경 감지를 위한 새 배열 복사
    setFamilyList([...familyList]);
  };

  const handleNext = () => {
    // 🌟 4. 다음 페이지로 가기 전, 여태까지 [추가]한 가족 배열을 전역 스토어에 저축!
    // 0개 이상이 가능하므로 빈 배열([]) 상태여도 정상적으로 넘어갑니다.
    setFamilyMembers(familyList);

    console.log("가족 구성원 전역 저장 완료:", familyList);
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

      <Content contentContainerStyle={{ paddingBottom: 40 }}>
        <Title>
          함께하고 있는{"\n"}가족 구성원을 알려주세요
        </Title>
        <Sub>0개 이상 등록이 가능하며, 해당사항이 없다면 바로 다음을 눌러주세요.</Sub>

        <InputGroup>
          <InputBox>
            <Label>성함</Label>
            <Input
              placeholder="성함 입력"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
          </InputBox>

          <InputBox>
            <Label>관계</Label>
            {/* 실제 기획에 따라 주관식 TextInput이거나 혹은 1단계처럼 버튼형일 텐데,
               Zustand 타입에 안전하게 매칭되도록 주관식 입력의 타입을 Relation으로 캐스팅 처리합니다.
            */}
            <Input
              placeholder="예: 자녀, 배우자"
              placeholderTextColor="#9CA3AF"
              value={relation}
              onChangeText={(text) => setRelation(text as Relation)}
            />
          </InputBox>
        </InputGroup>

        <AddButton onPress={handleAddFamily} activeOpacity={0.8}>
          <Plus size={24} color="#ffffff" />
          <AddText>가족 구성원 추가</AddText>
        </AddButton>

        {familyList.length > 0 && (
          <ListArea>
            {familyList.map((item, index) => (
              <FamilyItem key={index}>
                <ItemTextGroup>
                  <ItemName>{item.name}</ItemName>
                  <ItemRelation>{item.relation}</ItemRelation>
                </ItemTextGroup>

                <TouchableOpacity onPress={() => handleRemoveFamily(index)}>
                  <X size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </FamilyItem>
            ))}
          </ListArea>
        )}
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
// 스타일드 컴포넌트는 기존 UI를 완벽히 유지합니다.
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
  margin-bottom: 54px;
`;

const InputGroup = styled.View`
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
  color: #1a1c1e;
`;

const AddButton = styled.TouchableOpacity`
  height: 72px;
  border-radius: 22px;
  background-color: #1a1c1e;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
`;

const AddText = styled.Text`
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
  margin-left: 8px;
`;

const ListArea = styled.View`
  border-top-width: 1px;
  border-top-color: #e5e7eb;
  padding-top: 24px;
`;

const FamilyItem = styled.View`
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

const ItemTextGroup = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ItemName = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #1a1c1e;
  margin-right: 12px;
`;

const ItemRelation = styled.Text`
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
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