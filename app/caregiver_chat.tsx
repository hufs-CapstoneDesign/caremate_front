import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Bot,
  User,
  ChevronDown, // 드롭다운 화살표용 아이콘 추가
  Check // 선택된 세션 표시용 아이콘 추가
} from 'lucide-react-native';
import styled from 'styled-components/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View, FlatList, Text } from 'react-native';
import { Calendar as RNcalendar } from 'react-native-calendars';
import { router } from "expo-router";

// --- 타입 정의 ---
interface MessageItem {
  id: string;
  sender: 'ai' | 'patient'; 
  time: string;             
  text: string;             
}

interface SessionItem {
  session_id: string;
  session_time: string;
  messages: MessageItem[];
}

interface ChatDataResponse {
  chat_date: string;
  sessions: SessionItem[];
}

const PATIENT_ID = "6d3ef730-2ac9-4290-8db2-31859bcc49a5";

// 하드코딩된 3개의 가상 세션 데이터
const DUMMY_RESPONSE: ChatDataResponse = {
  chat_date: "2026-05-23",
  sessions: [
    {
      session_id: "session_01",
      session_time: "오전 10:02 (아침 통화)",
      messages: [
        { id: 'm1_1', sender: 'ai', time: '오전 10:02', text: '안녕하세요, 순자 어르신! 오늘 아침 식사는 맛있게 하셨나요?' },
        { id: 'm1_2', sender: 'patient', time: '오전 10:03', text: '응, 대충 물에 밥 말아서 김치랑 먹었어.' },
        { id: 'm1_3', sender: 'ai', time: '오전 10:03', text: '아침 약도 잊지 않고 챙겨 드셨을까요?' },
        { id: 'm1_4', sender: 'patient', time: '오전 10:04', text: '약? 아 맞다, 깜빡할 뻔했네. 지금 먹어야겠다.' }
      ]
    },
    {
      session_id: "session_02",
      session_time: "오후 02:15 (점심 통화)",
      messages: [
        { id: 'm2_1', sender: 'ai', time: '오후 02:15', text: '순자 어르신, 점심 식사 후 가벼운 산책은 다녀오셨나요?' },
        { id: 'm2_2', sender: 'patient', time: '오후 02:17', text: '날이 좀 희끄무리해서 그냥 경로당에서 노인네들이랑 놀았어.' },
        { id: 'm2_3', sender: 'ai', time: '오후 02:18', text: '친구분들과 즐거운 시간 보내셨군요! 물 자주 드시는 것 잊지 마세요.' }
      ]
    },
    {
      session_id: "session_03",
      session_time: "오후 07:30 (저녁 통화)",
      messages: [
        { id: 'm3_1', sender: 'ai', time: '오후 07:30', text: '어르신, 저녁은 든든하게 챙겨 드셨나요?' },
        { id: 'm3_2', sender: 'patient', time: '오후 07:32', text: '티비 보면서 대충 고구마 쪄 먹었지.' }
      ]
    }
  ]
};

export default function CaregiverChat() {
  const patient_id = PATIENT_ID;
  const [chatData, setChatData] = useState<ChatDataResponse | null>(null);
  const [activeSessionIndex, setActiveSessionIndex] = useState<number>(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false); 
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!patient_id || !selectedDate) return;
      setIsLoading(true);
      try {
        const url = `http://${process.env.EXPO_PUBLIC_API_URL}/chats/${patient_id}/${selectedDate}`;
        const response = await fetch(url);
        
        if (response.status === 200) {
          const data: ChatDataResponse = await response.json();
          setChatData(data);
          setActiveSessionIndex(0); 
        } else {
          setChatData(DUMMY_RESPONSE);
          setActiveSessionIndex(0);
        }
      } catch (error) {
        console.error("⚠️ 대화 원본 로딩 실패:", error);
        setChatData(DUMMY_RESPONSE);
        setActiveSessionIndex(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [patient_id, selectedDate]);

  const currentMessages = chatData?.sessions?.[activeSessionIndex]?.messages || [];
  const currentSessionTitle = chatData?.sessions?.[activeSessionIndex]?.session_time || "통화 기록 선택";

  const renderChatItem = ({ item }: { item: MessageItem }) => {
    const isAI = item.sender === 'ai';
    return (
      <MessageContainer isAI={isAI}>
        <AvatarWrapper isAI={isAI}>
          {isAI ? <Bot size={16} color="#4A90E2" /> : <User size={16} color="#FF9F43" />}
        </AvatarWrapper>

        <MessageBodyWrapper isAI={isAI}>
          <SenderName>{isAI ? "인공지능 말벗" : "김순자 어르신"}</SenderName>
          <BubbleAndContainer isAI={isAI}>
            <ChatBubble isAI={isAI}>
              <ChatText isAI={isAI}>{item.text}</ChatText>
            </ChatBubble>
            <TimeText>{item.time}</TimeText>
          </BubbleAndContainer>
        </MessageBodyWrapper>
      </MessageContainer>
    );
  };

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <HeaderTitle>대화 원본 보기</HeaderTitle>
        <TouchableOpacity onPress={() => setCalendarVisible(true)}>
          <CalendarIcon color="#333" size={22} />
        </TouchableOpacity>
      </Header>

      {/* 달력 모달 */}
      <Modal visible={isCalendarVisible} animationType="fade" transparent={true} onRequestClose={() => setCalendarVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCalendarVisible(false)}>
          <View style={styles.calendarContainer}>
            <RNcalendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarVisible(false);
              }}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: '#3b82f6' } }}
              theme={{ todayTextColor: '#3b82f6', arrowColor: '#3b82f6' }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 💡 스타일 수정: 독립적인 모서리가 둥근 파란 테두리 박스 영역 */}
      <SelectorWrapper>
        <DropdownSelector onPress={() => setDropdownVisible(true)}>
          <DropdownSelectorText>{selectedDate} ㆍ {currentSessionTitle}</DropdownSelectorText>
          <ChevronDown size={16} color="#4A90E2" /> 
        </DropdownSelector>
      </SelectorWrapper>

      {/* 드롭다운 팝업 리스트 모달 */}
      <Modal visible={isDropdownVisible} animationType="slide" transparent={true} onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity style={styles.dropdownModalOverlay} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
          <DropdownSheetContainer>
            <DropdownHeader>
              <DropdownHeaderTitle>확인할 통화 선택</DropdownHeaderTitle>
            </DropdownHeader>
            {chatData?.sessions?.map((session, index) => {
              const isSelected = index === activeSessionIndex;
              return (
                <DropdownItem 
                  key={session.session_id} 
                  isSelected={isSelected}
                  onPress={() => {
                    setActiveSessionIndex(index);
                    setDropdownVisible(false);
                  }}
                >
                  <DropdownItemText isSelected={isSelected}>{session.session_time}</DropdownItemText>
                  {isSelected && <Check size={16} color="#4A90E2" />}
                </DropdownItem>
              );
            })}
          </DropdownSheetContainer>
        </TouchableOpacity>
      </Modal>

      {/* 대화 리스트 영역 */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={currentMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyView>
              <EmptyText>해당 날짜의 통화 기록이 없습니다.</EmptyText>
            </EmptyView>
          }
        />
      )}
    </Container>
  );
}

// --- 스타일 정의 ---
const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center' },
  calendarContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 15, elevation: 10 },
  dropdownModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' }
});

const Container = styled.SafeAreaView` flex: 1; background-color: #F8F9FB; `;
const Header = styled.View` flex-direction: row; justify-content: space-between; align-items: center; padding: 15px 20px; background-color: #FFF; border-bottom-width: 1px; border-bottom-color: #F0F2F5; `;
const HeaderTitle = styled.Text` font-size: 18px; font-weight: 700; color: #333; `;

// 💡 변경 핵심: 상단 바에 여백을 주기 위한 외부 Wrapper 추가
const SelectorWrapper = styled.View`
  padding: 16px 20px 8px 20px;
`;

// 💡 변경 핵심: 독립된 라운드 카드 형태 + 파란색 테두리(border) 스타일 적용
const DropdownSelector = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #FFF;               /* 배경을 깔끔한 흰색 카드로 변경 */
  padding: 14px 18px;
  border-radius: 14px;                  /* 모서리를 리포트 NoticeBox와 맞춰 둥글게 가공 */
  border-width: 1.2px;                  /* 얇은 테두리 선 생성 */
  border-color: rgba(74, 144, 226, 0.4); /* 연하고 세련된 테마 파란색 테두리 지정 */
  
  /* 리포트 카드들과 일치하는 은은한 그림자 효과 */
  shadow-color: #4A90E2;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 4px;
  elevation: 2;
`;

const DropdownSelectorText = styled.Text` 
  font-size: 13px; 
  font-weight: 600; 
  color: #4A90E2;                       /* 텍스트 칼라도 테마 색상 블루로 포인트 변경 */
`;

// 하단 팝업 시트 형태의 드롭다운 컨테이너 스타일
const DropdownSheetContainer = styled.View`
  background-color: #FFF;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px 20px;
  padding-bottom: 40px;
`;
const DropdownHeader = styled.View` margin-bottom: 15px; border-bottom-width: 1px; border-bottom-color: #F0F2F5; padding-bottom: 10px; `;
const DropdownHeaderTitle = styled.Text` font-size: 16px; font-weight: 700; color: #333; `;
const DropdownItem = styled.TouchableOpacity<{ isSelected: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 12px;
  border-radius: 12px;
  background-color: ${props => props.isSelected ? '#F0F7FF' : 'transparent'};
  margin-bottom: 4px;
`;
const DropdownItemText = styled.Text<{ isSelected: boolean }>`
  font-size: 14px;
  font-weight: ${props => props.isSelected ? '700' : '500'};
  color: ${props => props.isSelected ? '#4A90E2' : '#555'};
`;

// 메시지 레이아웃 스타일
const MessageContainer = styled.View<{ isAI: boolean }>` flex-direction: ${props => props.isAI ? 'row' : 'row-reverse'}; margin-bottom: 20px; align-items: flex-start; `;
const AvatarWrapper = styled.View<{ isAI: boolean }>` width: 36px; height: 36px; border-radius: 12px; background-color: ${props => props.isAI ? '#F0F7FF' : '#FFF9F2'}; justify-content: center; align-items: center; margin-left: ${props => props.isAI ? '0px' : '10px'}; margin-right: ${props => props.isAI ? '10px' : '0px'}; border-width: 1px; border-color: ${props => props.isAI ? '#E0EFFF' : '#FFEAD2'}; `;
const MessageBodyWrapper = styled.View<{ isAI: boolean }>` flex: 1; align-items: ${props => props.isAI ? 'flex-start' : 'flex-end'}; `;
const SenderName = styled.Text` font-size: 12px; color: #777; font-weight: 600; margin-bottom: 4px; `;
const BubbleAndContainer = styled.View<{ isAI: boolean }>` flex-direction: ${props => props.isAI ? 'row' : 'row-reverse'}; align-items: flex-end; max-width: 85%; `;
const ChatBubble = styled.View<{ isAI: boolean }>` background-color: ${props => props.isAI ? '#FFF' : '#4A90E2'}; border-radius: 16px; padding: 12px 16px; elevation: 2; shadow-color: #000; shadow-offset: 0px 2px; shadow-opacity: 0.04; shadow-radius: 4px; `;
const ChatText = styled.Text<{ isAI: boolean }>` font-size: 14px; line-height: 20px; color: ${props => props.isAI ? '#333' : '#FFF'}; font-weight: 500; `;
const TimeText = styled.Text` font-size: 10px; color: #999; margin-left: 6px; margin-right: 6px; margin-bottom: 2px; `;
const EmptyView = styled.View` flex: 1; align-items: center; justify-content: center; padding-top: 100px; `;
const EmptyText = styled.Text` font-size: 14px; color: #999; `;