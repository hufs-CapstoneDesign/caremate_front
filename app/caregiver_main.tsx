import { router } from "expo-router";
import { Activity, Bell, Calendar, User, Phone, Plus } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

// --- 타입 정의 (TypeScript 빨간 줄 방지) ---
interface StyleProps {
  color?: string;
  backgroundColor?: string;
}

const GuardianMain = () => {
  return (
    <Container>
      {/* 상단 헤더 */}
      <Header>
        <GreetingSection>
          <SubTitle>가족의 마음을 잇는</SubTitle>
          <Title>케어메이트 <TitleBlue>보호자</TitleBlue></Title>
        </GreetingSection>
        <IconGroup>
          <TouchableOpacity activeOpacity={0.7}>
            <Bell color="#333" size={24} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: 15 }}>
            <User color="#333" size={24} />
          </TouchableOpacity>
        </IconGroup>
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        {/* 현재 환자 상태 카드 */}
        <StatusCard activeOpacity={0.9}>
          <CardHeader>
            <PatientInfo>
              <Avatar source={{ uri: 'https://via.placeholder.com/100' }} />
              <View>
                <PatientName>김순자 어르신</PatientName>
              </View>
            </PatientInfo>
          </CardHeader>
        </StatusCard>

        {/* 퀵 메뉴 섹션 */}
        <MenuGrid>
          <MenuButton onPress={() => router.push("/caregiver_report")}>
            <MenuIconBox backgroundColor="#EEF5FF">
              <Calendar color="#4A90E2" size={28} />
            </MenuIconBox>
            <MenuText>리포트 열람</MenuText>
          </MenuButton>
        <MenuButton activeOpacity={0.7}>
          <MenuIconBox backgroundColor="#FFF0F0">
            {/* 아이콘을 Phone으로 변경하고, 옆의 파란색/초록색 버튼과 채도를 맞춘 연한 빨간색 적용 */}
            <Phone color="#FF6B6B" size={28} />
          </MenuIconBox>
          <MenuText>전화 걸기</MenuText>
        </MenuButton>
          <MenuButton onPress={() => router.push("/caregiver_scheduling")}>
            {/* 배경색 명도/채도를 옆의 버튼들(#EEF5FF, #FFF0F0)과 맞춘 연한 초록색 계열로 변경 */}
            <MenuIconBox backgroundColor="#E8F5E9">
            {/* 아이콘을 '활동' 대신 '스케줄' 의미가 강한 시계(Clock) 또는 달력으로 변경 */}
            <Calendar color="#2ECC71" size={28} />
          </MenuIconBox>
          <MenuText>전화 스케줄링</MenuText>
          </MenuButton>
        </MenuGrid>

        {/* 실시간 알림 피드 */}
        <SectionHeader>
          <SectionTitle>최근 알림</SectionTitle>
          <TouchableOpacity><MoreText>전체보기</MoreText></TouchableOpacity>
        </SectionHeader>

        <NotificationItem>
          <NotiPoint />
          <NotiContent>
            <NotiText>[오전 10:30] 전화 3회 미수신 - 즉시 확인 필요</NotiText>
            <NotiTime>방금 전</NotiTime>
          </NotiContent>
        </NotificationItem>

        <NotificationItem>
          <NotiContent>
            <NotiText>[오전 09:15] 어르신 산책 활동을 시작했습니다.</NotiText>
            <NotiTime>1시간 전</NotiTime>
          </NotiContent>
        </NotificationItem>

        {/* 기존의 복잡한 추가 카드를 지우고 이 버튼으로 교체 */}
        <AddPatientButton activeOpacity={0.6}>
          <PlusIconWrapper>
            <Plus color="#9CA3AF" size={18} />
          </PlusIconWrapper>
        <AddPatientText>내 환자 추가하기</AddPatientText>
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
  padding: 20px;
  background-color: #FFF;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const GreetingSection = styled.View``;

const SubTitle = styled.Text`
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: 700;
  color: #333;
`;

const TitleBlue = styled.Text`
  color: #4A90E2;
`;

const IconGroup = styled.View`
  flex-direction: row;
`;

const Content = styled.ScrollView`
  padding: 20px;
`;

const StatusCard = styled.TouchableOpacity`
  background-color: #FFF;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.05;
  shadow-radius: 10px;
  elevation: 3;
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
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 15px;
  background-color: #EEE;
`;

const PatientName = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const StatusTag = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #F0FFF4;
  padding: 4px 8px;
  border-radius: 4px;
`;

const StatusTagText = styled.Text`
  font-size: 11px;
  color: #2ECC71;
  font-weight: 600;
`;

const StatusDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #2ECC71;
  margin-right: 6px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: #F5F5F5;
  margin: 15px 0;
`;

const CardBody = styled.View``;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const InfoItem = styled.View`
  flex: 1;
`;

const InfoLabel = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const InfoLabelText = styled.Text`
  font-size: 12px;
  color: #999;
`;

const InfoValue = styled.Text<StyleProps>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.color || '#333'};
`;

const MenuGrid = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const MenuButton = styled.TouchableOpacity`
  align-items: center;
  width: 28%;
`;

const MenuIconBox = styled.View<StyleProps>`
  width: 65px;
  height: 65px;
  border-radius: 22px;
  background-color: ${props => props.backgroundColor || '#EEE'};
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

const MenuText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #333;
`;

const MoreText = styled.Text`
  font-size: 13px;
  color: #999;
`;

const NotificationItem = styled.View`
  background-color: #FFF;
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
`;

const NotiPoint = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #FF6B6B;
  margin-right: 12px;
`;

const NotiContent = styled.View`
  flex: 1;
`;

const NotiText = styled.Text`
  font-size: 14px;
  color: #444;
  line-height: 20px;
  margin-bottom: 4px;
`;

const NotiTime = styled.Text`
  font-size: 12px;
  color: #BBB;
`;
// --- 스타일 정의 추가/수정 ---

const AddPatientButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  border-width: 2px;
  border-color: #D1D5DB; /* 연한 그레이 */
  border-style: dashed; /* 점선 테두리 */
  border-radius: 16px;
  background-color: transparent;
  margin-top: 10px;
  margin-bottom: 30px;
`;

const AddPatientText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #9CA3AF; /* 테두리와 맞춘 그레이 톤 */
  margin-left: 8px;
`;

// 플러스 아이콘을 감싸는 원형 (선택 사항, 깔끔함을 위해 추가)
const PlusIconWrapper = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #F3F4F6;
  justify-content: center;
  align-items: center;
`;