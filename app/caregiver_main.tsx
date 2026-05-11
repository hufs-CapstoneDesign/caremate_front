import { Activity, Bell, Calendar, ChevronRight, User } from 'lucide-react-native';
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
                <PatientName>김정숙 어르신</PatientName>
                <StatusTag>
                  <StatusDot />
                  <StatusTagText>현재 원활히 케어 중</StatusTagText>
                </StatusTag>
              </View>
            </PatientInfo>
            <ChevronRight color="#CCC" size={20} />
          </CardHeader>
          
          <Divider />

          <CardBody>
            <InfoRow>
              <InfoItem>
                <InfoLabel>
                  <Calendar size={14} color="#999" style={{ marginRight: 4 }} />
                  <InfoLabelText>담당 간병인</InfoLabelText>
                </InfoLabel>
                <InfoValue>이영희 간병사</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <Activity size={14} color="#999" style={{ marginRight: 4 }} />
                  <InfoLabelText>오늘의 컨디션</InfoLabelText>
                </InfoLabel>
                <InfoValue color="#4A90E2">매우 좋음</InfoValue>
              </InfoItem>
            </InfoRow>
          </CardBody>
        </StatusCard>

        {/* 퀵 메뉴 섹션 */}
        <MenuGrid>
          <MenuButton>
            <MenuIconBox backgroundColor="#EEF5FF">
              <Calendar color="#4A90E2" size={28} />
            </MenuIconBox>
            <MenuText>간병 일지</MenuText>
          </MenuButton>
          <MenuButton>
            <MenuIconBox backgroundColor="#FFF0F0">
              <Activity color="#FF6B6B" size={28} />
            </MenuIconBox>
            <MenuText>실시간 상태</MenuText>
          </MenuButton>
          <MenuButton>
            <MenuIconBox backgroundColor="#F0FFF4">
              <Bell color="#2ECC71" size={28} />
            </MenuIconBox>
            <MenuText>병원 예약</MenuText>
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
            <NotiText>[오전 10:30] 약 복용 완료 (고혈압 약)</NotiText>
            <NotiTime>방금 전</NotiTime>
          </NotiContent>
        </NotificationItem>

        <NotificationItem>
          <NotiContent>
            <NotiText>[오전 09:15] 어르신 산책 활동을 시작했습니다.</NotiText>
            <NotiTime>1시간 전</NotiTime>
          </NotiContent>
        </NotificationItem>
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