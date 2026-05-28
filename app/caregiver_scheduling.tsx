import React, { useState, useEffect } from 'react';
import { Switch, TouchableOpacity, View, Alert, Platform, ActivityIndicator } from 'react-native';
import { router } from "expo-router";
import { Calendar, ChevronLeft, Clock, Phone, X, Plus } from 'lucide-react-native';
import styled from 'styled-components/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import axios from 'axios';

const PATIENT_ID = "6d3ef730-2ac9-4290-8db2-31859bcc49a5";

// --- 타입 정의 ---
interface SelectionProps {
  isSelected: boolean;
}

interface ScheduleItem {
  id: string;   // API의 schedule_id 또는 신규 등록용 임시 ID
  day: string;  // '월', '화', '수' 등
  time: Date;   // 화면 표시 및 피커 연동용 Date 객체
}

// 백엔드 응답 객체 구조 정의 (추후 요일 필드명이 변경되면 이곳을 수정하세요)
interface ApiResponseSchedule {
  schedule_id: string;
  time: string;       // "09:00", "14:00" 등 (HH:mm)
  dayOfWeek?: number; // 요일별 조회를 위해 추가 요청하신 요일 필드 가동
}

const GuardianAISetting = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentDay, setCurrentDay] = useState('월');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // 12시간제 포맷 변환 함수 (화면 표시용: 오전/오후 hh:mm)
  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${ampm} ${hours}:${strMinutes}`;
  };

  // 백엔드 전송/비교용 시간 포맷 변환 (HH:mm)
  const formatBackendTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // HH:mm 문자열을 받아 오늘 날짜 기준의 Date 객체로 변환
  const parseBackendTimeToDate = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    return date;
  };

  // 1. [조회] API 명세서 기반 기존 스케줄 데이터 가져오기
  useEffect(() => {
    const fetchExistingSchedules = async () => {
      try {
        setIsLoading(true);
        // 명세서 규격: GET /schedules/{patient_id}
        const response = await axios.get(`http://${process.env.EXPO_PUBLIC_API_URL}/schedules/${PATIENT_ID}`);
        
        if (response.data && response.data.schedules) {
          // 명세서의 "schedules" 내부 리스트 파싱
          const mappedSchedules = response.data.schedules.map((item: ApiResponseSchedule, index: number) => {
            return {
              // 백엔드에서 준 schedule_id를 고유 key로 매핑 (없을 시 대안 id 생성)
              id: item.schedule_id || `existing_${index}_${Date.now()}`,
              // 추후 추가될 요일 필드 연동 (기본값 0 - 월요일)
              day: item.dayOfWeek !== undefined ? days[item.dayOfWeek] : '월',
              time: parseBackendTimeToDate(item.time)
            };
          });

          // 요일 순으로 정렬하여 세팅
          const sortedSchedules = mappedSchedules.sort((a: ScheduleItem, b: ScheduleItem) => {
            return days.indexOf(a.day) - days.indexOf(b.day);
          });
          
          setSchedules(sortedSchedules);
        }
      } catch (error) {
        console.error("기존 스케줄 로딩 실패:", error);
        // API 연동 실패 혹은 데이터 없을 시 예외 처리용 더미 데이터
        const dummySchedules: ScheduleItem[] = [
          { id: 'uuid-1', day: '월', time: parseBackendTimeToDate('09:00') },
          { id: 'uuid-2', day: '화', time: parseBackendTimeToDate('14:00') },
        ];
        setSchedules(dummySchedules);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingSchedules();
  }, []);

  // 시간 변경 이벤트 핸들러
  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCurrentTime(selectedDate);
    }
  };

  // 스케줄 추가 함수
  const addSchedule = () => {
    const isDuplicate = schedules.some(
      (item) => item.day === currentDay && 
      item.time.getHours() === currentTime.getHours() && 
      item.time.getMinutes() === currentTime.getMinutes()
    );

    if (isDuplicate) {
      Alert.alert('안내', '이미 동일한 요일과 시간에 설정된 스케줄이 있습니다.');
      return;
    }

    const newSchedule: ScheduleItem = {
      id: `new_${Date.now()}`, // 신규 생성 항목 임시 고유 ID
      day: currentDay,
      time: currentTime,
    };

    const updated = [...schedules, newSchedule].sort((a, b) => {
      return days.indexOf(a.day) - days.indexOf(b.day);
    });

    setSchedules(updated);
  };

  // 스케줄 삭제 함수 (기존 내역 및 신규 추가 내역 모두 X 클릭 시 삭제 가능)
  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter((item) => item.id !== id));
  };

  // 2. [수정 및 저장] 변경사항 최종 반영 후 서버 전송
  const handleSaveSchedules = async () => {
    if (isEnabled && schedules.length === 0) {
      Alert.alert('안내', '최소 하나 이상의 요일별 시간대를 추가해주세요.');
      return;
    }

    // 전송할 페이로드 구성
    const payload = {
      aiCallEnabled: isEnabled,
      schedules: isEnabled ? schedules.map(item => ({
        // 기존에 발급받았던 ID가 있으면 유지하고, 신규 데이터면 보낼 때 제외하거나 임시 처리 가능
        schedule_id: item.id.startsWith('new_') ? null : item.id,
        dayOfWeek: item.day, // 백엔드 확장 필드 명칭에 맞춰 전송
        time: formatBackendTime(item.time)
      })) : []
    };

    console.log("=== 서버 전송 최종 데이터 ===", JSON.stringify(payload, null, 2));

    try {
      // 기존 명세서 기반 저장 API 통신 (POST 또는 PUT 프로젝트 규칙에 따라 사용)
      await axios.patch(`http://${process.env.EXPO_PUBLIC_API_URL}/schedules/${PATIENT_ID}`, payload);
      
      Alert.alert('성공', 'AI 안부 전화 설정이 수정되었습니다.', [
        { text: '확인', onPress: () => router.push("/caregiver_main") }
      ]);
    } catch (error) {
      Alert.alert('오류', '설정 저장 중 문제가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#4A90E2" />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      {/* 상단 헤더 */}
      <Header>
        <TouchableOpacity onPress={() => router.push("/caregiver_main")}>
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
            {/* 요일 및 시간 지정 영역 */}
            <SettingSection>
              <LabelRow>
                <Calendar size={18} color="#666" />
                <LabelText>요일 및 시간 추가/수정</LabelText>
              </LabelRow>
              
              {/* 요일 선택 */}
              <DayContainer>
                {days.map((day) => (
                  <DayButton
                    key={day}
                    isSelected={currentDay === day}
                    onPress={() => setCurrentDay(day)}
                  >
                    <DayText isSelected={currentDay === day}>{day}</DayText>
                  </DayButton>
                ))}
              </DayContainer>

              {/* 시간 설정 버튼 */}
              <TimePickerButton onPress={() => setShowPicker(true)}>
                <LabelRow style={{ marginBottom: 0 }}>
                  <Clock size={16} color="#4A90E2" />
                  <TimeText style={{ marginLeft: 6 }}>{formatTime(currentTime)}</TimeText>
                </LabelRow>
                <ChangeText>시간 설정</ChangeText>
              </TimePickerButton>

              {showPicker && (
                <DateTimePicker
                  value={currentTime}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}

              {/* 추가 버튼 */}
              <AddScheduleButton onPress={addSchedule} activeOpacity={0.7}>
                <Plus size={16} color="#FFF" />
                <AddButtonText>이 시간대에 발신 추가</AddButtonText>
              </AddScheduleButton>
            </SettingSection>

            {/* 최종 스케줄 리스트 박스 영역 */}
            <SettingSection>
              <LabelRow style={{ marginBottom: 10 }}>
                <SectionTitle style={{ fontSize: 15 }}>현재 설정된 알림 스케줄 목록</SectionTitle>
              </LabelRow>
              <SectionDesc style={{ marginBottom: 15 }}>
                미리 설정되어 있던 스케줄입니다. X 버튼을 눌러 취소하거나 위에서 새 시간을 추가해 수정할 수 있습니다.
              </SectionDesc>
              
              {schedules.length === 0 ? (
                <EmptyText>설정된 발신 시간대가 없습니다. 위에서 요일과 시간을 지정해 추가해 주세요.</EmptyText>
              ) : (
                <ScheduleGrid>
                  {schedules.map((item) => (
                    <ScheduleTag key={item.id}>
                      <TagDayText>{item.day}요일</TagDayText>
                      <TagTimeText>{formatTime(item.time)}</TagTimeText>
                      <DeleteIconButton onPress={() => removeSchedule(item.id)}>
                        <X size={14} color="#999" />
                      </DeleteIconButton>
                    </ScheduleTag>
                  ))}
                </ScheduleGrid>
              )}
            </SettingSection>
          </>
        )}

        {/* 저장 버튼 */}
        <SaveButton activeOpacity={0.8} onPress={handleSaveSchedules}>
          <SaveButtonText>수정된 설정 저장하기</SaveButtonText>
        </SaveButton>
      </Content>
    </Container>
  );
};

export default GuardianAISetting;

// --- 스타일 정의 ---
// --- 스타일 정의 ---
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #F8F9FB;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
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
  margin-top: 15px;
  margin-bottom: 15px;
  border-width: 1px;
  border-color: #EAECEF;
`;

const TimeText = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: #4A90E2;
`;

const ChangeText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #777;
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

const AddScheduleButton = styled.TouchableOpacity`
  flex-direction: row;
  background-color: #4A90E2;
  padding: 14px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
`;

const AddButtonText = styled.Text`
  color: #FFF;
  font-size: 14px;
  font-weight: 600;
  margin-left: 6px;
`;

const ScheduleGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const ScheduleTag = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #F0F5FF;
  border-width: 1px;
  border-color: #D6E4FF;
  padding: 8px 12px;
  border-radius: 8px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

/* --- 빨간 줄 생겼던 컴포넌트 선언부 시작 --- */
const TagDayText = styled.Text`
  font-size: 13px;
  font-weight: 700;
  color: #4A90E2;
  margin-right: 6px;
`;

const TagTimeText = styled.Text`
  font-size: 13px;
  color: #555;
  margin-right: 6px;
`;

const DeleteIconButton = styled.TouchableOpacity`
  padding: 2px;
`;

const EmptyText = styled.Text`
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 20px 0;
  line-height: 18px;
`;
/* --- 빨간 줄 생겼던 컴포넌트 선언부 끝 --- */

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