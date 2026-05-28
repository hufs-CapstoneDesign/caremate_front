import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { useAddPatientStore } from "@/store/addPatientStore";

const RELATIONS = [
  "자녀",
  "배우자",
  "손주/손녀",
  "형제/자매",
  "기타",
] as const;

type Relation = (typeof RELATIONS)[number] | "";

export default function AddPatientBasicInfo() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [relation, setRelation] = useState<Relation>("");

  const setBasicInfo = useAddPatientStore((state) => state.setBasicInfo);

  const handleNext = () => {
    setBasicInfo({
      name,
      age,
      relation,
    });

    router.push("/caregiver_add_patient/symptom");
  };

  return (
    <Container>
      <Header>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>

        <ProgressWrapper>
          <Progress />
        </ProgressWrapper>

        <Spacer />
      </Header>

      <Content>
        <Title>
          환자분의 기초 정보를{"\n"}알려주세요
        </Title>

        <Sub>
          AI가 더 자연스러운 대화를 위해 참고합니다.
        </Sub>

        <Label>이름</Label>
        <Input
          placeholder="성함 입력"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName} 
        />

        <Label>나이</Label>
        <Input
          placeholder="만 나이 입력"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <Label>환자와의 관계</Label>

        <RelationGrid>
          {RELATIONS.map((item) => (
            <RelationButton
              key={item}
              selected={relation === item}
              onPress={() => setRelation(item)}
            >
              <RelationText selected={relation === item}>
                {item}
              </RelationText>
            </RelationButton>
          ))}
        </RelationGrid>

        <NextButton
          disabled={!name || !age || !relation}
          onPress={handleNext}
        >
          <NextText>다음으로</NextText>
        </NextButton>
      </Content>
    </Container>
  );
}

const Container = styled.SafeAreaView`
flex:1;
background:#F8F9FB;
`;

const Header = styled.View`
padding:20px;
flex-direction:row;
justify-content:space-between;
align-items:center;
`;

const Spacer = styled.View`
width:24px;
`;

const ProgressWrapper = styled.View`
width:120px;
height:6px;
background:#ECECEC;
border-radius:10px;
`;

const Progress = styled.View`
width:20%;
height:100%;
background:#4A90E2;
border-radius:10px;
`;

const Content = styled.ScrollView`
padding:20px;
`;

const Title = styled.Text`
font-size:38px;
font-weight:700;
color:#1A1C1E;
`;

const Sub = styled.Text`
margin-top:16px;
font-size:18px;
color:#888;
margin-bottom:48px;
`;

const Label = styled.Text`
font-size:18px;
font-weight:700;
margin-bottom:12px;
`;

const Input = styled.TextInput`
background:#FFF;
height:72px;
border-radius:20px;
padding:20px;
font-size:18px;
margin-bottom:32px;
`;

const RelationGrid = styled.View`
flex-direction:row;
flex-wrap:wrap;
justify-content:space-between;
`;

const RelationButton = styled.TouchableOpacity<{selected:boolean}>`
width:48%;
height:76px;

border-radius:20px;

justify-content:center;
align-items:center;

margin-bottom:14px;

background:${p=>p.selected?"#EEF5FF":"#FFF"};

border-width:2px;

border-color:${p=>p.selected?"#4A90E2":"#EEE"};
`;

const RelationText = styled.Text<{selected:boolean}>`
font-size:18px;

font-weight:600;

color:${p=>p.selected?"#4A90E2":"#666"};
`;

const NextButton = styled.TouchableOpacity`
height:72px;

border-radius:24px;

background:#4A90E2;

justify-content:center;

align-items:center;

margin-top:50px;

margin-bottom:50px;
`;

const NextText = styled.Text`
color:white;

font-size:20px;

font-weight:700;
`;