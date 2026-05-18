import {
  Activity,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  MessageCircle,
  Pill,
  Smile,
  Utensils
} from 'lucide-react-native';
import styled from 'styled-components/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LocaleConfig, Calendar as RNcalendar } from 'react-native-calendars';

// --- 타입 정의 ---
interface ProgressProps {
  $width: string;  // Transient props로 밑줄 에러 해결
  $color: string;
}

interface ReportDetail {
  id: string;
  report_date: string;
  mood: string | null;
  medication: {
    time: string | null;
    taken: boolean;
    source: string;
    drug_name: string | null;
  } | null;
  meal: {
    menu: string | null;
    time: string | null;
    eaten: boolean;
    source: string;
  } | null;
  physical: {
    source: string;
    condition: string | null;
    complaints: string | null;
  } | null;
  call_summary: string | null;
  daily_activity: string | null;
  session_count: number;
  last_updated: string;
}

const PATIENT_ID = "6d3ef730-2ac9-4290-8db2-31859bcc49a5"; 

export default function CaregiverReport() {
  const patient_id = PATIENT_ID; 
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-05-18"); // 가이드 예시 날짜 [cite: 6]

  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!patient_id || !selectedDate) return;
      setIsLoading(true);
      try {
        // API 가이드 경로 적용 [cite: 4, 6]
        const url = `http://192.168.0.47:8000/reports/${patient_id}/${selectedDate}`;
        const response = await fetch(url);
        
        if (response.status === 200) {
          const data: ReportDetail = await response.json();
          
          setReportDetail(data);
        } else {
          setReportDetail(null);
        }
      } catch (error) {
        console.error("⚠️ 상세 리포트 로딩 실패:", error);
        setReportDetail(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportDetail();
  }, [patient_id, selectedDate]);

  if (isLoading) return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large" /></View>;

  return (
    <Container>
      <Header>
        <TouchableOpacity><ChevronLeft color="#333" size={24} /></TouchableOpacity>
        <HeaderTitle>간병 리포트</HeaderTitle>
        <TouchableOpacity onPress={() => setCalendarVisible(true)}>
          <CalendarIcon color="#333" size={22} />
        </TouchableOpacity>
      </Header>

      {/* 캘린더 모달 복구 */}
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
            <StatusBadge><StatusText>분석완료</StatusText></StatusBadge>
          </ProfileSection>
          <SummaryInfo>
            <PatientName>김순자 어르신</PatientName>
            <MainStatus>{selectedDate} 리포트</MainStatus>
          </SummaryInfo>
        </SummaryBanner>

        <DetailSection>
          <SectionLabel>상세 지표 (AI 분석)</SectionLabel>
          <DetailCard>
            <MetricRow>
              <MetricLabelGroup>
                <Utensils size={18} color="#FF9F43" />
                <MetricTitle>식사 여부</MetricTitle>
              </MetricLabelGroup>
              <MetricValueGroup>
                {['아침', '점심', '저녁'].map((time) => {
                  // API 데이터의 time과 일치하고 eaten이 true인지 확인 [cite: 27-28, 69-71]
                  const isEaten = reportDetail?.meal?.time === time && reportDetail?.meal?.eaten;
                  return (
                    <MealStatus key={time}>
                      <MealText>{time}</MealText>
                      <StatusIconWrapper isEaten={isEaten}>
                        {isEaten ? (
                          <Smile size={14} color="#FFF" /> // 먹었으면 체크(스마일) 표시
                        ) : (
                          <View style={{ width: 14, height: 14 }} /> // 안 먹었으면 빈 칸
                        )}
                      </StatusIconWrapper>
                    </MealStatus>
                  );
                })}
              </MetricValueGroup>
            </MetricRow>

            <MetricRow>
              <MetricLabelGroup>
                <Pill size={18} color="#FF6B6B" />
                <MetricTitle>일일 복약</MetricTitle>
              </MetricLabelGroup>
              <MetricValueGroup>
                {['아침', '저녁'].map((time) => {
                  // 서버 응답: medication.time이 "아침"이고 taken이 true인지 확인
                  const isTaken = reportDetail?.medication?.time === time && reportDetail?.medication?.taken === true;
                  return (
                    <StatusItem key={time}>
                      <StatusLabel>{time}</StatusLabel>
                      <StatusCircle isActive={isTaken} activeColor="#FF6B6B">
                        {isTaken && <Smile size={14} color="#FFF" />}
                      </StatusCircle>
                    </StatusItem>
                  );
                })}
              </MetricValueGroup>
            </MetricRow>

            <MetricRow>
              <MetricLabelGroup>
                <Activity size={18} color="#4A90E2" />
                <MetricTitle>신체 컨디션</MetricTitle>
              </MetricLabelGroup>
              <MetricValueGroup>
                <SimpleValueText>
                  {reportDetail?.physical?.condition ?? "정보 없음"}
                </SimpleValueText>
              </MetricValueGroup>
            </MetricRow>

            <MetricRow last>
              <MetricLabelGroup>
                <Smile size={18} color="#2ECC71" />
                <MetricTitle>감정 상태</MetricTitle>
              </MetricLabelGroup>
              <MetricValueGroup>
                <SimpleValueText>
                  {reportDetail?.mood ?? "정보 없음"}
                </SimpleValueText>
              </MetricValueGroup>
            </MetricRow>
          </DetailCard>
        </DetailSection>

        <SectionHeader>
          <SectionLabel>통화 요약</SectionLabel>
        </SectionHeader>
        <Timeline>
          {[
            { 
              key: 'health', 
              label: '건강/복약', 
              icon: <Pill size={16} color="#FF6B6B" />, 
              bgColor: '#FFF5F5',
              content: reportDetail?.physical?.condition ?? "기록된 건강 정보가 없습니다." 
            },
            { 
              key: 'meal', 
              label: '식사 기록', 
              icon: <Utensils size={16} color="#FF9F43" />, 
              bgColor: '#FFF9F2',
             content: reportDetail?.meal?.menu 
               ? `${reportDetail.meal.time ?? '식사'}: ${reportDetail.meal.menu}` 
                : "기록된 식사 메뉴가 없습니다."
            },
            { 
              key: 'emotion', 
              label: '정서/감정', 
              icon: <Smile size={16} color="#2ECC71" />, 
              bgColor: '#F2FBF5',
              content: reportDetail?.mood ?? "감정 분석 데이터가 없습니다." 
            },
            { 
              key: 'daily', 
              label: '일상/기타', 
              icon: <MessageCircle size={16} color="#4A90E2" />, 
              bgColor: '#F0F7FF',
              content: reportDetail?.call_summary ?? "기록된 일상 내용이 없습니다." 
            }
          ].map((section) => (
            <TimelineItem key={section.key}>
              {/* TimeText(왼쪽 라벨)를 제거하고 EventBox만 꽉 차게 배치 */}
              <EventBox>
                <IconWrapper backgroundColor={section.bgColor}>
                  {section.icon}
                </IconWrapper>
                <EventInfo style={{ flex: 1 }}>
                  <EventTitle>{section.label}</EventTitle>
                  <EventSub numberOfLines={3}>
                    {section.content}
                  </EventSub>
                </EventInfo>
              </EventBox>
            </TimelineItem>
          ))}
        </Timeline>
      </Content>
    </Container>
  );
}

// --- 스타일 정의 ($ 변수 적용) ---
const ProgressBar = styled.View<ProgressProps>` 
  height: 100%; 
  width: ${props => props.$width}; 
  background-color: ${props => props.$color}; 
`;

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center' },
  calendarContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 15, elevation: 10 }
});

// ... 나머지 Styled-components 정의는 기존과 동일
const Container = styled.SafeAreaView` flex: 1; background-color: #F8F9FB; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 15px 20px; background-color: #FFF; `;
const HeaderTitle = styled.Text` font-size: 18px; font-weight: 700; color: #333; `;
const Content = styled.ScrollView` padding: 20px; `;
const SummaryBanner = styled.View` flex-direction: row; align-items: center; background-color: #FFF; padding: 20px; border-radius: 20px; margin-bottom: 25px; `;
const ProfileSection = styled.View` position: relative; margin-right: 20px; `;
const Avatar = styled.Image` width: 70px; height: 70px; border-radius: 35px; background-color: #EEE; `;
const StatusBadge = styled.View` position: absolute; bottom: 0; align-self: center; background-color: #2ECC71; padding: 2px 8px; border-radius: 10px; border-width: 2px; border-color: #FFF; `;
const StatusText = styled.Text` color: #FFF; font-size: 10px; font-weight: 700; `;
const SummaryInfo = styled.View` flex: 1; `;
const PatientName = styled.Text` font-size: 30px; color: #000000; margin-bottom: 4px; `;
const MainStatus = styled.Text` font-size: 18px; font-weight: 700; color: #333; line-height: 24px; `;
const DetailSection = styled.View` margin-bottom: 25px; `;
const SectionLabel = styled.Text` font-size: 16px; font-weight: 700; color: #333; margin-bottom: 12px; `;
const DetailCard = styled.View` background-color: #FFF; border-radius: 20px; padding: 20px; `;
const MetricRow = styled.View<{ last?: boolean }>` flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: ${props => props.last ? '0px' : '20px'}; `;
const MetricLabelGroup = styled.View` flex-direction: row; align-items: center; `;
const MetricTitle = styled.Text` font-size: 14px; color: #555; margin-left: 10px; `;
const MetricValueGroup = styled.View` flex-direction: row; align-items: center; justify-content: flex-end; flex: 1; `;
const ProgressBarBase = styled.View` width: 80px; height: 6px; background-color: #F0F2F5; border-radius: 3px; margin-right: 10px; overflow: hidden; `;
const ScoreText = styled.Text` font-size: 14px; font-weight: 700; color: #333; width: 80px; text-align: right; `;
const SectionHeader = styled.View` flexDirection: row; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const Timeline = styled.View``;
const TimelineItem = styled.View` flex-direction: row; align-items: center; margin-bottom: 12px; `;
const TimeText = styled.Text` width: 50px; font-size: 13px; color: #999; `;
const EventBox = styled.View` flex: 1; flex-direction: row; align-items: center; background-color: #FFF; padding: 15px; border-radius: 15px; `;
const IconWrapper = styled.View<{ backgroundColor: string }>` width: 36px; height: 36px; border-radius: 12px; background-color: ${props => props.backgroundColor}; justify-content: center; align-items: center; margin-right: 12px; `;
const EventInfo = styled.View``;
const EventTitle = styled.Text` font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; `;
const EventSub = styled.Text` font-size: 12px; color: #999; `;
const MealStatus = styled.View`
  align-items: center;
  margin-left: 15px;
`;

const MealText = styled.Text`
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
`;

const StatusIconWrapper = styled.View<{ isEaten?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${props => props.isEaten ? '#FF9F43' : '#F0F0F0'};
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.isEaten ? '#FF9F43' : '#DDD'};
`;
const StatusItem = styled.View`
  align-items: center;
  margin-left: 15px;
`;

const StatusLabel = styled.Text`
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
`;

// 아이콘을 감싸는 동그라미 (활성화 여부에 따라 색상 변경)
const StatusCircle = styled.View<{ isActive?: boolean; activeColor: string }>`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  background-color: ${props => props.isActive ? props.activeColor : '#F0F2F5'};
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.isActive ? props.activeColor : '#E0E0E0'};
`;

// 프로그레스 바 대신 사용할 텍스트 스타일
const SimpleValueText = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  text-align: right;
`;
