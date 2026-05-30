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
import {fetchConversation} from '../services/api';
import {Alert} from 'react-native';

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

export default function CaregiverChat() {
  const patient_id = PATIENT_ID;
  const [chatData, setChatData] = useState<ChatDataResponse | null>(null);
  const [activeSessionIndex, setActiveSessionIndex] = useState<number>(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false); 
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const hasSessions = chatData?.sessions && chatData.sessions.length > 0;
  const currentMessages = hasSessions ? chatData?.sessions?.[activeSessionIndex]?.messages || [] : [];
  
  useEffect(() => {
  const loadChatHistory = async () => {
    // 라우터 파라미터나 상태값으로 전달받은 targetDate(예: selectedDate)가 없으면 실행 방지
    if (!selectedDate) return; 

    setIsLoading(true);
    try {
      // 🌟 1. 생짜 fetch 대신 api.js의 11번 fetchConversation 함수를 호출합니다.
      // 인자값으로 조회하고자 하는 특정 날짜(date)를 넘겨줍니다.
      const chatData: any = await fetchConversation(selectedDate);

      if (chatData) {
        console.log(`✅ [${selectedDate}] 대화 내역 원본 수신 성공:`, chatData);
        
        // 🌟 2. 서버에서 받아온 대화 배열을 채팅방 상태(State)에 바인딩합니다.
        // 기존에 사용하시던 메시지 저장용 setState 변수명으로 매칭해 주세요. (예: setMessages)
        setChatData(chatData); 
      } else {
        setChatData(null); // 데이터가 비어있으면 빈 배열 처리
      }
    } catch (error) {
      console.error(`❌ [${selectedDate}] 대화 내용 조회 실패:`, error);
      Alert.alert("오류", "대화 내역을 불러오지 못했습니다. 네트워크 상태를 확인해 주세요.");
      setChatData(null);
    } finally {
      setIsLoading(false);
    }
  };

  loadChatHistory();
}, [selectedDate]); // 선택된 날짜가 변경될 때마다 새로운 대화 내역을 요청합니다.


  // 🌟 [수정] 세션이 없을 때 상단 바에 표시될 텍스트 방어 코드
  const currentSessionTitle = hasSessions 
    ? chatData?.sessions?.[activeSessionIndex]?.session_time || "통화 기록 선택"
    : "통화 기록 없음";

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
            
            {/* 🌟 [수정] 통화 기록(세션)이 없을 때 표시할 모달 내 텍스트 컴포넌트 추가 */}
            {!hasSessions ? (
              <EmptyDropdownText>확인할 수 있는 통화 기록이 없습니다.</EmptyDropdownText>
            ) : (
              chatData?.sessions?.map((session, index) => {
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
              })
            )}
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
            // 🌟 [수정] 데이터가 비었을 때 출력될 UI
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

// 🌟 [추정 추가] 드롭다운 전용 비어있음 스타일 컴포넌트
const EmptyDropdownText = styled.Text`
  font-size: 14px;
  color: #999;
  text-align: center;
  padding: 24px 0;
`;