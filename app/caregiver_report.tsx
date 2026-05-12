import {
  Activity,
  AlertCircle,
  Calendar as CalendarIcon, // 이름 중복 방지를 위해 변경
  ChevronLeft,
  MessageCircle,
  Pill,
  Smile,
  Utensils,
} from 'lucide-react-native';
import styled from 'styled-components/native';

import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LocaleConfig, Calendar as RNcalendar } from 'react-native-calendars';

LocaleConfig.locales['kr'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

// --- 타입 정의 ---
interface ProgressProps {
  width: string;
  color: string;
}

const GuardianReport = () => {
  const days = [
    { d: '일', n: '10' },
    { d: '월', n: '11' },
    { d: '화', n: '12', active: true },
    { d: '수', n: '13' },
    { d: '목', n: '14' },
    { d: '금', n: '15' },
    { d: '토', n: '16' },
  ];
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <Container>
      <Header>
        <TouchableOpacity>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <HeaderTitle>간병 리포트</HeaderTitle>
        
        {/* 수정 포인트: 캘린더 아이콘 버튼에 onPress 추가 */}
        <TouchableOpacity onPress={() => setCalendarVisible(true)}>
          <CalendarIcon color="#333" size={22} />
        </TouchableOpacity>
      </Header>

      <DateBar>
        {days.map((item, index) => (
          <DateItem key={index} active={item.active}>
            <DayText active={item.active}>{item.d}</DayText>
            <NumText active={item.active}>{item.n}</NumText>
            {item.active && <ActiveDot />}
          </DateItem>
        ))}
      </DateBar>

      {/* 캘린더 모달 */}
      <Modal
        visible={isCalendarVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setCalendarVisible(false)} 
        >
          <View style={styles.calendarContainer}>
            <RNcalendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarVisible(false);
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#3b82f6' }
              }}
              theme={{
                todayTextColor: '#3b82f6',
                arrowColor: '#3b82f6',
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Content showsVerticalScrollIndicator={false}>
        <SummaryBanner>
          <ProfileSection>
            <Avatar source={{ uri: 'https://via.placeholder.com/80' }} />
            <StatusBadge><StatusText>안정</StatusText></StatusBadge>
          </ProfileSection>
          <SummaryInfo>
            <PatientName>김정숙 어르신</PatientName>
            <MainStatus>오늘 하루는 <Highlight>매우 안정적</Highlight>이었어요.</MainStatus>
          </SummaryInfo>
        </SummaryBanner>

        <DetailSection>
          <SectionLabel>상세 지표 (AI 분석)</SectionLabel>
          <DetailCard>
            <MetricRow>
              <MetricLabelGroup>
                <Utensils size={18} color="#FF9F43" />
                <MetricTitle>식사 섭취</MetricTitle>
              </MetricLabelGroup>
              <MetricValueGroup>
                <ProgressBarBase><ProgressBar width="100%" color="#FF9F43" /></ProgressBarBase>
                <ScoreText>3/3회</ScoreText>
                <TrustIconPlaceholder />
              </MetricValueGroup>
            </MetricRow>

            <MetricRow>
              <MetricLabelGroup>
                <Pill size={18} color="#FF6B6B" />
                <MetricTitle>일일 복약</MetricTitle>
              </MetricLabelGroup>
              <MetricValueGroup>
                <ProgressBarBase><ProgressBar width="50%" color="#FF6B6B" /></ProgressBarBase>
                <ScoreText>1/2회</ScoreText>
                <TouchableOpacity onPress={() => Alert.alert('AI 신뢰도 주의', '환자의 답변이 불분명하여 복약 여부 판독이 어렵습니다.')}>
                  <AlertCircle size={16} color="#FF6B6B" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </MetricValueGroup>
            </MetricRow>

            <MetricRow>
              <MetricLabelGroup>
                <Activity size={18} color="#4A90E2" />
                <MetricTitle>신체 컨디션</MetricTitle>
              </MetricLabelGroup>
              <MetricValueGroup>
                <ProgressBarBase><ProgressBar width="85%" color="#4A90E2" /></ProgressBarBase>
                <ScoreText>85점</ScoreText>
                <TrustIconPlaceholder />
              </MetricValueGroup>
            </MetricRow>

            <MetricRow last>
              <MetricLabelGroup>
                <Smile size={18} color="#2ECC71" />
                <MetricTitle>감정 상태</MetricTitle>
              </MetricLabelGroup>
              <MetricValueGroup>
                <ProgressBarBase><ProgressBar width="92%" color="#2ECC71" /></ProgressBarBase>
                <ScoreText>92점</ScoreText>
                <TouchableOpacity onPress={() => Alert.alert('AI 신뢰도 주의', '감정 표현의 맥락이 불분명하여 분석 결과가 부정확할 수 있습니다.')}>
                  <AlertCircle size={16} color="#FF6B6B" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </MetricValueGroup>
            </MetricRow>
          </DetailCard>
          <TrustGuideText>* 주의 표시(<AlertCircle size={10} color="#FF6B6B" />)는 AI 해석 신뢰도가 낮아, 보호자가 직접 확인해야 함을 의미합니다.</TrustGuideText>
        </DetailSection>

        <SectionHeader>
          <SectionLabel>통화 요약</SectionLabel>
          <TouchableOpacity><ViewMore>전체보기</ViewMore></TouchableOpacity>
        </SectionHeader>

        <Timeline>
          <TimelineItem>
            <TimeText>복약, 건강</TimeText>
            <EventBox>
              <IconWrapper backgroundColor="#EEF5FF"><Utensils color="#4A90E2" size={16} /></IconWrapper>
              <EventInfo>
                <EventTitle>아침 식사 완료</EventTitle>
                <EventSub>전복죽 1그릇, 물 150ml</EventSub>
              </EventInfo>
            </EventBox>
          </TimelineItem>
          {/* ... 이하 타임라인 생략 ... */}
        </Timeline>
        
        <ChatOriginButton activeOpacity={0.8} onPress={() => Alert.alert('대화 원본', '전체 대화 텍스트 화면으로 이동합니다.')}>
          <MessageCircle color="#4A90E2" size={20} />
          <ChatOriginButtonText>전체 대화 원본 보기</ChatOriginButtonText>
        </ChatOriginButton>
      </Content>
    </Container>
  );
};

export default GuardianReport;

// --- 스타일 정의는 기존과 동일하게 유지 ---
const Container = styled.SafeAreaView` flex: 1; background-color: #F8F9FB; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 15px 20px; background-color: #FFF; `;
const HeaderTitle = styled.Text` font-size: 18px; font-weight: 700; color: #333; `;
const DateBar = styled.View` flex-direction: row; justify-content: space-between; padding: 15px 20px; background-color: #FFF; border-bottom-width: 1px; border-bottom-color: #F0F0F0; `;
const DateItem = styled.TouchableOpacity<{ active?: boolean }>` align-items: center; padding: 8px 10px; border-radius: 12px; background-color: ${props => props.active ? '#4A90E2' : 'transparent'}; `;
const DayText = styled.Text<{ active?: boolean }>` font-size: 12px; color: ${props => props.active ? '#FFF' : '#BBB'}; margin-bottom: 4px; `;
const NumText = styled.Text<{ active?: boolean }>` font-size: 15px; font-weight: 700; color: ${props => props.active ? '#FFF' : '#333'}; `;
const ActiveDot = styled.View` width: 4px; height: 4px; border-radius: 2px; background-color: #FFF; margin-top: 4px; `;
const Content = styled.ScrollView` padding: 20px; `;
const SummaryBanner = styled.View` flex-direction: row; align-items: center; background-color: #FFF; padding: 20px; border-radius: 20px; margin-bottom: 25px; `;
const ProfileSection = styled.View` position: relative; margin-right: 20px; `;
const Avatar = styled.Image` width: 70px; height: 70px; border-radius: 35px; background-color: #EEE; `;
const StatusBadge = styled.View` position: absolute; bottom: 0; align-self: center; background-color: #2ECC71; padding: 2px 8px; border-radius: 10px; border-width: 2px; border-color: #FFF; `;
const StatusText = styled.Text` color: #FFF; font-size: 10px; font-weight: 700; `;
const SummaryInfo = styled.View` flex: 1; `;
const PatientName = styled.Text` font-size: 14px; color: #888; margin-bottom: 4px; `;
const MainStatus = styled.Text` font-size: 18px; font-weight: 700; color: #333; line-height: 24px; `;
const Highlight = styled.Text` color: #4A90E2; `;
const DetailSection = styled.View` margin-bottom: 25px; `;
const SectionLabel = styled.Text` font-size: 16px; font-weight: 700; color: #333; margin-bottom: 12px; `;
const DetailCard = styled.View` background-color: #FFF; border-radius: 20px; padding: 20px; `;
const MetricRow = styled.View<{ last?: boolean }>` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: ${props => props.last ? '0px' : '20px'}; `;
const MetricLabelGroup = styled.View` flex-direction: row; align-items: center; `;
const MetricTitle = styled.Text` font-size: 14px; color: #555; margin-left: 10px; `;
const MetricValueGroup = styled.View` flex-direction: row; align-items: center; justify-content: flex-end; flex: 1; `;
const ProgressBarBase = styled.View` width: 80px; height: 6px; background-color: #F0F2F5; border-radius: 3px; margin-right: 10px; overflow: hidden; `;
const ProgressBar = styled.View<ProgressProps>` height: 100%; width: ${props => props.width}; background-color: ${props => props.color}; `;
const ScoreText = styled.Text` font-size: 14px; font-weight: 700; color: #333; width: 45px; text-align: right; `;
const TrustIconPlaceholder = styled.View` width: 16px; margin-left: 8px; `;
const TrustGuideText = styled.Text` font-size: 11px; color: #AAA; margin-top: 10px; text-align: right; `;
const SectionHeader = styled.View` flexDirection: row; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const ViewMore = styled.Text` font-size: 13px; color: #999; `;
const Timeline = styled.View``;
const TimelineItem = styled.View` flex-direction: row; align-items: center; margin-bottom: 12px; `;
const TimeText = styled.Text` width: 50px; font-size: 13px; color: #999; `;
const EventBox = styled.View` flex: 1; flex-direction: row; align-items: center; background-color: #FFF; padding: 15px; border-radius: 15px; `;
const IconWrapper = styled.View<{ backgroundColor: string }>` width: 36px; height: 36px; border-radius: 12px; background-color: ${props => props.backgroundColor}; justify-content: center; align-items: center; margin-right: 12px; `;
const EventInfo = styled.View``;
const EventTitle = styled.Text` font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; `;
const EventSub = styled.Text` font-size: 12px; color: #999; `;
const ChatOriginButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #FFF;
  border-width: 1px;
  border-color: #4A90E2;
  padding: 16px;
  border-radius: 14px;
  margin-top: 10px;
  margin-bottom: 20px;
`;
const ChatOriginButtonText = styled.Text` font-size: 15px; font-weight: 600; color: #4A90E2; margin-left: 8px; `;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});