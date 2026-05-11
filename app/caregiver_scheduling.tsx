import { Calendar, ChevronLeft, Clock, Phone } from 'lucide-react-native';
import React, { useState } from 'react';
import { Switch, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';


// --- 타입 정의 ---
interface SelectionProps {
  isSelected: boolean;
}

const GuardianAISetting = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedDays, setSelectedDays] = useState(['월', '수', '금']);

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <Container>
      {/* 상단 헤더 */}
      <Header>
        <TouchableOpacity>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <HeaderTitle>AI 안부 전화 설정</HeaderTitle>
        <View style={{ width: 24 }} />
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        {/* 메인 스위치 */}
        <SettingSection>
          <Row>
            <SectionInfo>
              <IconBox color="#EEF5FF"><Phone color="#4A90E2" size={20} /></IconBox>
              <View>
                <SectionTitle>AI 안부 전화 사용</SectionTitle>
                <SectionDesc>정해진 시간에 AI가 어르신께 전화를 드립니다.</SectionDesc>
              </View>
            </SectionInfo>
            <Switch
              trackColor={{ false: '#D1D1D1', true: '#4A90E2' }}
              thumbColor="#FFF"
              onValueChange={() => setIsEnabled(!isEnabled)}
              value={isEnabled}
            />
          </Row>
        </SettingSection>

        {isEnabled && (
          <>
            {/* 시간 설정 */}
            <SettingSection>
              <LabelRow>
                <Clock size={18} color="#666" />
                <LabelText>전화 발신 시간</LabelText>
              </LabelRow>
              <TimePickerButton>
                <TimeText>오전 10:30</TimeText>
                <ChangeText>변경</ChangeText>
              </TimePickerButton>
            </SettingSection>

            {/* 요일 선택 */}
            <SettingSection>
              <LabelRow>
                <Calendar size={18} color="#666" />
                <LabelText>발신 요일</LabelText>
              </LabelRow>
              <DayContainer>
                {days.map((day) => (
                  <DayButton
                    key={day}
                    isSelected={selectedDays.includes(day)}
                    onPress={() => toggleDay(day)}
                  >
                    <DayText isSelected={selectedDays.includes(day)}>{day}</DayText>
                  </DayButton>
                ))}
              </DayContainer>
            </SettingSection>
          </>
        )}

        {/* 저장 버튼 */}
        <SaveButton activeOpacity={0.8}>
          <SaveButtonText>설정 저장하기</SaveButtonText>
        </SaveButton>
      </Content>
    </Container>
  );
};

export default GuardianAISetting;

// --- 스타일 정의 ---

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #F8F9FB;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #FFF;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #333;
`;

const Content = styled.ScrollView`
  padding: 20px;
`;

const SettingSection = styled.View`
  background-color: #FFF;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 15px;
  shadow-color: #000;
  shadow-opacity: 0.03;
  shadow-radius: 8px;
  elevation: 2;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SectionInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconBox = styled.View<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: ${props => props.color};
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const SectionDesc = styled.Text`
  font-size: 13px;
  color: #999;
`;

const LabelRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const LabelText = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: #555;
  margin-left: 8px;
`;

const TimePickerButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #F8F9FB;
  padding: 15px;
  border-radius: 12px;
`;

const TimeText = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #4A90E2;
`;

const ChangeText = styled.Text`
  font-size: 14px;
  color: #999;
`;

const DayContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const DayButton = styled.TouchableOpacity<SelectionProps>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.isSelected ? '#4A90E2' : '#F0F2F5'};
`;

const DayText = styled.Text<SelectionProps>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isSelected ? '#FFF' : '#777'};
`;

const PersonaGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const PersonaTag = styled.TouchableOpacity<SelectionProps>`
  padding: 10px 16px;
  border-radius: 100px;
  margin-right: 8px;
  margin-bottom: 8px;
  background-color: ${props => props.isSelected ? '#4A90E215' : '#FFF'};
  border-width: 1.5px;
  border-color: ${props => props.isSelected ? '#4A90E2' : '#EEE'};
`;

const PersonaText = styled.Text<SelectionProps>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.isSelected ? '#4A90E2' : '#777'};
`;

const SaveButton = styled.TouchableOpacity`
  background-color: #4A90E2;
  padding: 18px;
  border-radius: 16px;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 40px;
`;

const SaveButtonText = styled.Text`
  font-size: 17px;
  font-weight: 700;
  color: #FFF;
`;