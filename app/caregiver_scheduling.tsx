import React, { useState, useEffect } from 'react';
import { Switch, TouchableOpacity, View, Alert, Platform, ActivityIndicator } from 'react-native';
import { router } from "expo-router";
import { Calendar, ChevronLeft, Clock, Phone, X, Plus } from 'lucide-react-native';
import styled from 'styled-components/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {fetchSchedule, addSchedule} from '../services/api';
const PATIENT_ID = "6d3ef730-2ac9-4290-8db2-31859bcc49a5";

// --- 타입 정의 ---
interface SelectionProps {
  isSelected: boolean;
}

interface ScheduleItem {
  id: string;   
  day: string;  
  time: Date;   
}

interface ApiResponseSchedule {
  schedule_id: string;
  time: string;       
  dayOfWeek?: number; 
}

const GuardianAISetting = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentDay, setCurrentDay] = useState('월');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${ampm} ${hours}:${strMinutes}`;
  };

  const formatBackendTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const parseBackendTimeToDate = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    return date;
  };

useEffect(() => {
    const fetchExistingSchedules = async () => {
      try {
        setIsLoading(true);
        const response = await fetchSchedule(PATIENT_ID);
        
        if (response && response.schedule_list) {
          // 1. response.schedule_list를 바탕으로 백엔드 스펙 매핑
          const mappedSchedules = response.schedule_list.map((item: any, index: number) => {
            return {
              id: item.schedule_id || `existing_${index}_${Date.now()}`,
              day: item.day_of_week !== undefined ? days[item.day_of_week] : '월',
              time: parseBackendTimeToDate(item.call_time)
            };
          });

          // 2. 요일 순서대로 정렬
          const sortedSchedules = mappedSchedules.sort((a: any, b: any) => {
            return days.indexOf(a.day) - days.indexOf(b.day);
          });

          // 3. 🌟 화면 갱신 상태(State) 저장!
          setSchedules(sortedSchedules);
        } else {
          // schedule_list가 비어있거나 없을 때 예외 처리
          setSchedules([]);
        }
      } catch (error) {
        // 백엔드 통신 실패나 401/500 에러 디버깅 로그
        console.error("🚨 [스케줄 API 에러] 기존 스케줄 로딩 실패:", error);
        // 에러가 나더라도 앱이 크래시되지 않도록 안전하게 빈 배열로 초기화
        setSchedules([]); 
      } finally {
        // 로딩 애니메이션 인디케이터 해제
        setIsLoading(false);
      }
    };

    fetchExistingSchedules();
  }, []);

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCurrentTime(selectedDate);
    }
  };

  const submitSchedule = () => {
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
      id: `new_${Date.now()}`, 
      day: currentDay,
      time: currentTime,
    };

    const updated = [...schedules, newSchedule].sort((a, b) => {
      return days.indexOf(a.day) - days.indexOf(b.day);
    });

    setSchedules(updated);
  };

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter((item) => item.id !== id));
  };

  const handleSaveSchedules = async () => {
    if (isEnabled && schedules.length === 0) {
      Alert.alert('안내', '최소 하나 이상의 요일별 시간대를 추가해주세요.');
      return;
    }

    try {
      // 🌟 API 규격에 맞춰 PATIENT_ID와 payload를 인자로 넘겨주고 결과 데이터를 바로 받습니다.
      const payload = {
        ai_call_enabled: isEnabled,
        schedule_list: isEnabled ? schedules.map(item => ({
        // 기존에 발급받았던 ID가 있으면 유지하고, 신규 데이터면 보낼 때 제외하거나 임시 처리 가능
          day_of_week: days.indexOf(item.day), // 백엔드 확장 필드 명칭에 맞춰 전송
          call_time: formatBackendTime(item.time)
        })) : []
      };

      const data: any = await addSchedule(PATIENT_ID, payload);

      if (data) {
        console.log("✅ 일정 추가 성공:", data);
        // 이후 성공 시 처리할 UI 로직 (예: 모달 닫기, 새로고침 등)을 작성하세요.
      }
    } catch (error) {
      console.error("❌ 일정 추가 중 오류 발생:", error);
      Alert.alert("오류", "일정을 추가하지 못했습니다. 다시 시도해 주세요.");
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
      <Header>
        <TouchableOpacity onPress={() => router.push("/caregiver_main")}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <HeaderTitle>AI 안부 전화 설정</HeaderTitle>
        <View style={{ width: 24 }} />
      </Header>

      <Content showsVerticalScrollIndicator={false}>
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
            <SettingSection>
              <LabelRow>
                <Calendar size={18} color="#666" />
                <LabelText>요일 및 시간 추가/수정</LabelText>
              </LabelRow>
              
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
                  minuteInterval={10}
                  // 🌟 [수정] iOS 다크모드/테마 이슈로 글씨가 안 보이는 현상 완벽 방지
                  textColor="#000000" 
                  themeVariant="light"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}

              <AddScheduleButton onPress={submitSchedule} activeOpacity={0.7}>
                <Plus size={16} color="#FFF" />
                <AddButtonText>이 시간대에 발신 추가</AddButtonText>
              </AddScheduleButton>
            </SettingSection>

            <SettingSection>
              <LabelRow style={{ marginBottom: 10 }}>
                <SectionTitle style={{ fontSize: 15 }}>현재 설정된 알림 스케줄 목록</SectionTitle>
              </LabelRow>
              <SectionDesc style={{ marginBottom: 15 }}>
                미리 설정되어 있던 스케줄입니다. X 버튼을 눌러 취소하거나 위에서 새 시간을 추가해 수정할 수 있습니다.
              </SectionDesc>
              
              {schedules.length === 0 ? (
                // 🌟 [수정] 더미 데이터가 없으므로 스케줄이 빌 때 정상적으로 출력됩니다.
                <EmptyText>아직 설정된 발신 스케줄이 없습니다.</EmptyText>
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

        <SaveButton activeOpacity={0.8} onPress={handleSaveSchedules}>
          <SaveButtonText>수정된 설정 저장하기</SaveButtonText>
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
  padding: 8px 12px;
  border-radius: 20px;
  margin-right: 8px;
  margin-bottom: 8px;
  border-width: 1px;
  border-color: #D6E4FF;
`;

const TagDayText = styled.Text`
  font-size: 13px;
  font-weight: 700;
  color: #4A90E2;
  margin-right: 4px;
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
  font-size: 14px;
  color: #999;
  text-align: center;
  padding: 20px 0;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: #4A90E2;
  padding: 16px;
  border-radius: 16px;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 40px;
`;

const SaveButtonText = styled.Text`
  color: #FFF;
  font-size: 16px;
  font-weight: 700;
`;