import { router } from "expo-router";
import { Bell, Calendar, User, Phone, Plus } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View, ScrollView } from 'react-native';
import styled from 'styled-components/native';

// --- 타입 정의 (TypeScript 빨간 줄 방지) ---
interface StyleProps {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  isUrgent?: boolean;
  size?: number; // size 속성 추가로 빨간 줄 해결
}

const GuardianMain = () => {
  return (
    <Container>
      {/* 상단 헤더 */}
      <Header>
        <GreetingSection>
          <SubTitle fontSize={16}>가족의 마음을 잇는</SubTitle>
          <Title fontSize={26}>케어메이트 <TitleBlue>보호자</TitleBlue></Title>
        </GreetingSection>
        <IconGroup>
          <TouchableOpacity activeOpacity={0.7}>
            <Bell color="#333" size={30} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: 20 }}>
            <User color="#333" size={30} />
          </TouchableOpacity>
        </IconGroup>
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        {/* 현재 환자 상태 카드 */}
        <StatusCard activeOpacity={0.9}>
          <CardHeader>
            <PatientInfo>
              <Avatar source={require('./media/soonja.jpg')} />
              <View>
                <PatientName fontSize={22}>김순자 어르신</PatientName>
                <StatusTag>
                  <StatusDot backgroundColor="#2ECC71" />
                  <StatusTagText color="#2ECC71" fontSize={14}>현재 연결됨</StatusTagText>
                </StatusTag>
              </View>
            </PatientInfo>
          </CardHeader>
        </StatusCard>

        {/* 퀵 메뉴 섹션 */}
        <MenuGrid>
          <MenuButton onPress={() => router.push("/caregiver_report")}>
            <MenuIconBox backgroundColor="#EEF5FF" size={80}>
              <Calendar color="#4A90E2" size={36} />
            </MenuIconBox>
            <MenuText fontSize={16}>리포트 열람</MenuText>
          </MenuButton>
          <MenuButton activeOpacity={0.7}>
            <MenuIconBox backgroundColor="#FFF0F0" size={80}>
              <Phone color="#FF6B6B" size={36} />
            </MenuIconBox>
            <MenuText fontSize={16}>전화 걸기</MenuText>
          </MenuButton>
          <MenuButton onPress={() => router.push("/caregiver_scheduling")}>
            <MenuIconBox backgroundColor="#E8F5E9" size={80}>
              <Calendar color="#2ECC71" size={36} />
            </MenuIconBox>
            <MenuText fontSize={16}>전화 스케줄링</MenuText>
          </MenuButton>
        </MenuGrid>

        {/* 실시간 알림 피드 */}
        <SectionHeader>
          <SectionTitle fontSize={22}>최근 알림</SectionTitle>
          <TouchableOpacity><MoreText fontSize={16}>전체보기</MoreText></TouchableOpacity>
        </SectionHeader>

        {/* 긴급 알림 */}
        <NotificationItem isUrgent={true} backgroundColor="#FFF0F0">
          <NotiPoint backgroundColor="#FF6B6B" />
          <NotiContent>
            <NotiText fontSize={16} isUrgent={true} color="#1A1C1E">[오전 10:30] 전화 3회 미수신 - 즉시 확인 필요</NotiText>
            <NotiTime fontSize={14} color="#1A1C1E">방금 전</NotiTime>
          </NotiContent>
        </NotificationItem>


        {/* 환자 추가 버튼 */}
        <AddPatientButton activeOpacity={0.6}>
          <PlusIconWrapper>
            <Plus color="#9CA3AF" size={24} />
          </PlusIconWrapper>
          <AddPatientText fontSize={18}>내 환자 추가하기</AddPatientText>
        </AddPatientButton>
      </Content>
    </Container>
  );
};

export default GuardianMain;

// --- 스타일 정의 (Styled-Components) ---

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #F8F9FB;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  padding: 25px 20px;
  background-color: #FFF;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const GreetingSection = styled.View``;

const SubTitle = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 14}px;
  color: #888;
  margin-bottom: 6px;
`;

const Title = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 22}px;
  font-weight: 700;
  color: #333;
`;

const TitleBlue = styled.Text`
  color: #4A90E2;
`;

const IconGroup = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Content = styled(ScrollView)`
  padding: 25px 20px;
`;

const StatusCard = styled.TouchableOpacity`
  background-color: #FFF;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  shadow-color: #000;
  shadow-offset: 0px 5px;
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 4;
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const PatientInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Avatar = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: 35px;
  margin-right: 20px;
  background-color: #EEE;
`;

const PatientName = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 18}px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
`;

const StatusTag = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatusTagText = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 11}px;
  color: ${props => props.color || '#2ECC71'};
  font-weight: 500;
`;

const StatusDot = styled.View<StyleProps>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.backgroundColor || '#2ECC71'};
  margin-right: 8px;
`;

const MenuGrid = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 35px;
  padding: 0 10px;
`;

const MenuButton = styled.TouchableOpacity`
  align-items: center;
  width: 30%;
`;

const MenuIconBox = styled.View<StyleProps>`
  width: ${props => props.size || 65}px;
  height: ${props => props.size || 65}px;
  border-radius: 25px;
  background-color: ${props => props.backgroundColor || '#EEE'};
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
`;

const MenuText = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 14}px;
  font-weight: 500;
  color: #555;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 18}px;
  font-weight: 700;
  color: #333;
`;

const MoreText = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 13}px;
  color: #999;
`;

const NotificationItem = styled.View<StyleProps>`
  background-color: ${props => props.backgroundColor || '#FFF'};
  padding: 15px;
  border-radius: 16px;
  margin-bottom: 15px;
  flex-direction: row;
  align-items: center;
  ${props => props.isUrgent && `
    border-width: 1px;
    border-color: #FF6B6B;
  `}
`;

const NotiPoint = styled.View<StyleProps>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.backgroundColor || '#BBB'};
  margin-right: 15px;
`;

const NotiContent = styled.View`
  flex: 1;
`;

const NotiText = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 14}px;
  color: ${props => props.color || '#444'};
  line-height: 24px;
  margin-bottom: 6px;
  ${props => props.isUrgent && `
    font-weight: 700;
  `}
`;

const NotiTime = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 12}px;
  color: ${props => props.color || '#BBB'};
`;

const AddPatientButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 70px;
  border-width: 2px;
  border-color: #D1D5DB;
  border-style: dashed;
  border-radius: 20px;
  background-color: transparent;
  margin-top: 15px;
  margin-bottom: 40px;
`;

const AddPatientText = styled.Text<StyleProps>`
  font-size: ${props => props.fontSize || 16}px;
  font-weight: 600;
  color: #9CA3AF;
  margin-left: 10px;
`;

const PlusIconWrapper = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: #F3F4F6;
  justify-content: center;1A1C1E
  align-items: center;
`;