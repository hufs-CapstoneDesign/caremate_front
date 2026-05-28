import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Bot,
  User,
  ChevronDown, 
  Check 
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

// ⭕ 요청하신 새로운 API 응답 포맷에 완벽히 맞춘 더미(Fallback) 데이터 구조
const DUMMY_RESPONSE: ChatDataResponse = {
  chat_date: "2026-05-23",
  sessions: [
    {
      session_id: "session_01",
      session_time: "오전 10:02",
      messages: [
        { id: 'msg_01', sender: 'ai', time: '오전 10:02', text: '안녕하세요, 순자 어르신! 오늘 아침 식사는 맛있게 하셨나요?' },
        { id: 'msg_02', sender: 'patient', time: '오전 10:03', text: '응, 대충 물에 밥 말아서 김치랑 먹었어.' },
        { id: 'msg_03', sender: 'ai', time: '오전 10:03', text: '아침 약도 잊지 않고 챙겨 드셨을까요?' }
      ]
    },
    {
      session_id: "session_02",
      session_time: "오후 02:15",
      messages: [
        { id: 'msg_04', sender: 'ai', time: '오후 02:15', text: '순자 어르신, 점심 식사 후 가벼운 산책은 다녀오셨나요?' }
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
        const url = `http://${process.env.EXPO_PUBLIC_API_URL}/conversations/${selectedDate}`;
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

      {/* 상단 바 선택 영역 */}
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

const SelectorWrapper = styled.View`
  padding: 16px 20px 8px 20px;
`;

const DropdownSelector = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #FFF;               
  padding: 14px 18px;
  border-radius: 14px;                  
  border-width: 1.2px;                  
  border-color: rgba(74, 144, 226, 0.4); 
  
  shadow-color: #4A90E2;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 4px;
  elevation: 2;
`;

const DropdownSelectorText = styled.Text` 
  font-size: 13px; 
  font-weight: 600; 
  color: #4A90E2;                       
`;

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