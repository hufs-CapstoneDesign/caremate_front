import { router } from "expo-router";
import { Bell, Calendar, User, Phone, Plus, LogOut } from 'lucide-react-native';
import React, { useState, useEffect } from 'react'; // 🌟 API 상태 관리를 위한 useState 추가
import { TouchableOpacity, View, ScrollView, Alert, ActivityIndicator, Text } from 'react-native'; // 🌟 순정 Text 컴포넌트 추가
import styled from 'styled-components/native';
import * as SecureStore from "expo-secure-store"; // 🌟 토큰 조회를 위해 추가
import { registerAndSendFcmToken } from "../utils/fcm"; // 🌟 공통 FCM 함수 추가 (경로 확인 필요)
import {fetchPatientInfo, requestCall} from "../services/api.js"; // 🌟 API 호출 함수 추가 (경로 확인 필요)
import * as Notifications from 'expo-notifications'; // 🌟 실시간 푸시 알림 감지를 위해 추가

// --- 백엔드 연결을 위한 설정 ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const Spacer = styled.View`
  height: 15px;
  `;

// --- 타입 정의 (TypeScript 빨간 줄 방지) ---
interface StyleProps {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  isUrgent?: boolean;
  size?: number; // size 속성 추가로 빨간 줄 해결
}

const GuardianMain = () => {
  // 🌟 통화 요청 중복 탭 방지 및 로딩 표시용 상태
  const [isCalling, setIsCalling] = useState(false);
  
  // 🌟 동적 환자 연동을 위한 상태 추가
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  
  // 🌟 [수정 완료] 초기 가상 데이터 제거 및 실시간 누적용 빈 배열 설정
  const [notifications, setNotifications] = useState<any[]>([]);

const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: async () => {
            try {
              // 로컬에 저장된 토큰 삭제
              await SecureStore.deleteItemAsync("userToken");
              await SecureStore.deleteItemAsync("CONNECTED_PATIENT_ID");
              await SecureStore.deleteItemAsync("CONNECTED_PATIENT_NAME");
              await SecureStore.deleteItemAsync("userRole");
              // 시작 화면(인덱스)으로 튕겨내기
              router.replace("/");
            } catch (error) {
              console.error("로그아웃 실패:", error);
              Alert.alert("에러", "로그아웃 처리에 실패했습니다.");
            }
          }
        }
      ]
    );
  };

  // 🌟 기기 저장소에서 환자 정보를 읽어오고, 로드 완료 후 FCM 토큰을 동기화합니다.
  useEffect(() => {
    const initializeCaregiverSession = async () => {
      // [1단계] 환자 정보 API 호출
      // 응답: [{ patient_id: string, name: string }]
      let currentPatientId: string | null = null;

      try {
        const response = await fetchPatientInfo(null);
        const patient = Array.isArray(response) ? response[0] : null;
        
        if (patient?.patient_id) {
          setPatientId(patient.patient_id);
          setPatientName(patient.name ?? null);
          currentPatientId = patient.patient_id;
          console.log("✅ 환자 정보 로드 성공:", patient);
        } else {
          console.warn("연결된 환자가 없습니다.");
        }
      } catch (error) {
        console.error("환자 정보 API 호출 실패:", error);
        Alert.alert("오류", "환자 정보를 불러오지 못했습니다. 네트워크를 확인해 주세요.");
      }

      // [2단계] 환자 ID 확보 후 FCM 토큰 등록
      if (currentPatientId) {
        try {
          const caregiverToken = await SecureStore.getItemAsync("userToken");
          if (caregiverToken) {
            await registerAndSendFcmToken(caregiverToken, "CAREGIVER");
          }
          console.log("✅ 보호자용 FCM 토큰 등록 성공");
        } catch (error) {
          console.error("보호자 메인 FCM 등록 중 오류 발생:", error);
        }
      }
    };

    initializeCaregiverSession();
  }, []);

  // 🌟 앱이 열려있을 때 날아오는 실시간 FCM 알림을 감지하는 리스너
  useEffect(() => {
    // 1. 알림이 도착했을 때 실행되는 핸들러 등록
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("🔔 실시간 푸시 수신:", notification);
      
      // 백엔드가 보낸 FCM 데이터 주머니(payload) 꺼내기
      const { title, body } = notification.request.content;
      const data = notification.request.content.data; // 필요 시 백엔드가 숨겨보낸 추가 데이터

      // 현재 시간을 예쁘게 포맷팅 ([오후 02:15] 형태)
      const now = new Date();
      const timeString = `[${now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true })}]`;

      // 새로운 알림 객체 생성
      const newNoti = {
        id: notification.request.identifier || `noti_${Date.now()}`,
        isUrgent: body?.includes('미수신') || body?.includes('긴급') || false,
        text: `${timeString} ${body || '새로운 알림이 도착했습니다.'}`,
        time: '방금 전',
        date: now, // 3일 이내 필터링 계산용 Date 객체 주입
        backgroundColor: (body?.includes('미수신') || body?.includes('긴급')) ? '#FFF0F0' : '#FFF'
      };

      // 🌟 [수정 완료] 새 알림이 올 때마다 이전 알림들과 함께 누적 배열을 형성하고 최근 3일치만 남깁니다.
      setNotifications(prev => {
        const updatedList = [newNoti, ...prev];
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        return updatedList.filter(noti => {
          const notiDate = noti.date ? new Date(noti.date) : new Date();
          return notiDate >= threeDaysAgo;
        });
      });
    });

    // 2. 컴포넌트가 꺼질 때 리스너를 해제하여 메모리 누수 방지
    return () => subscription.remove();
  }, []);

  // 🌟 [전화 걸기] 메뉴를 탭했을 때 백엔드로 FCM 발송 중계를 요청하는 함수
  const handleRequestCall = async () => {
    // 상수가 아닌 상태값 검사 가드 추가
    if (!patientId) {
      Alert.alert("안내", "먼저 환자를 등록해 주세요.");
      return;
    }
    
    if (isCalling) return;

    try {
      setIsCalling(true);

      // 🌟 1. 생짜 fetch 대신 정확한 API인 requestCall 함수를 호출합니다.
      // 인자값으로 백엔드가 원하는 patient_id와 call_type 구조를 그대로 넘겨줍니다.
      const result = await requestCall({
        patient_id: patientId,
      });

      console.log("통화 요청 API 응답:", result);

      // 🌟 2. 백엔드가 준 JSON 응답 규격인 result.success 값을 기준으로 체크합니다.
      if (result && result.success) {
        // 백엔드가 준 성공 메시지("환자에게 AI 통화 요청 푸시를 성공적으로 발송했습니다.")를 알림창에 띄워줍니다.
        Alert.alert("통화 연결 시도", result.message || "어르신께 AI 안부 통화 신호를 보냈습니다. 잠시만 기다려주세요.");
      } else {
        // 백엔드 연결은 되었으나 success가 false이거나 응답 값이 비어있을 때
        Alert.alert("연결 실패", result?.message || "서버 응답이 올바르지 않습니다.");
      }
      
    } catch (error) {
      // api.js 내부에서 네트워크 상태 코드가 에러면 throw 하므로 이리로 들어옵니다.
      console.error("실시간 통화 요청 오류:", error);
      Alert.alert("연결 실패", "서버 네트워크 상태를 확인 후 다시 시도해 주세요.");
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <Container>
      {/* 상단 헤더 */}
      <Header>
        <GreetingSection>
          <SubTitle fontSize={16}>가족의 마음을 잇는</SubTitle>
          <Title fontSize={26}>케어메이트 <TitleBlue>보호자</TitleBlue></Title>
        </GreetingSection>
        <IconGroup>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace("/")}>
            <Bell color="#333" size={30} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: 20 }}>
            <User color="#333" size={30} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: 20 }} onPress={handleLogout}>
            <LogOut color="#333" size={30} />
          </TouchableOpacity>
        </IconGroup>
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        {/* 현재 환자 상태 카드 */}
        {patientId ? (
          // 🌟 [1] 환자가 등록되어 있을 때 보여줄 동적 UI
          <>
            {/* 현재 환자 상태 카드 */}
            <StatusCard activeOpacity={0.9}>
              <CardHeader>
                <PatientInfo>
                  <Avatar source={require('./media/soonja.jpg')} />
                  <View>
                    {/* 하드코딩 이름을 동적 상태값으로 교체 */}
                    <PatientName fontSize={22}>
                      {patientName ? `${patientName} 어르신` : "등록된 어르신"}
                    </PatientName>
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

              <MenuButton activeOpacity={0.7} onPress={handleRequestCall}>
                <MenuIconBox backgroundColor="#FFF0F0" size={80}>
                  {isCalling ? (
                    <ActivityIndicator size="small" color="#FF6B6B" />
                  ) : (
                    <Phone color="#FF6B6B" size={36} />
                  )}
                </MenuIconBox>
                <MenuText fontSize={16}>{isCalling ? "연결 중" : "전화 걸기"}</MenuText>
              </MenuButton>

              <MenuButton onPress={() => router.push("/caregiver_scheduling")}>
                <MenuIconBox backgroundColor="#E8F5E9" size={80}>
                  <Calendar color="#2ECC71" size={36} />
                </MenuIconBox>
                <MenuText fontSize={16}>전화 스케줄링</MenuText>
              </MenuButton>
            </MenuGrid>
          </>
        ) : (
          <View style={{ 
            padding: 30, 
            backgroundColor: '#FFF', 
            borderRadius: 24, 
            marginTop: 10, 
            alignItems: 'center', 
            borderWidth: 1,
            borderColor: '#EAEAEA',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 10,
            elevation: 2 
          }}>
            {/* 🌟 Lucide 아이콘의 타입 딴지를 피하기 위해 컴포넌트 자체를 강제 캐스팅 처리 */}
            {React.createElement(User as any, { color: "#CCC", size: 48, style: { marginBottom: 14 } })}
            
            {/* 🌟 이제 상단에서 정상 임포트된 Text 컴포넌트가 아무 에러 없이 안착합니다 */}
            <Text style={{ fontSize: 18, color: '#333', fontWeight: '700', marginBottom: 6 }}>연결된 환자가 없습니다.</Text>
            <Text style={{ fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 20 }}>
              하단의 '환자 추가하기' 버튼을 눌러 코드를 발급받고{"\n"}환자 앱과 연동을 완료해 주세요.
            </Text>
          </View>
        )}
        <Spacer />
        <Spacer />
        

        {/* 실시간 알림 피드 */}
        <SectionHeader>
          <SectionTitle fontSize={22}>최근 알림</SectionTitle>
          <TouchableOpacity><MoreText fontSize={16}>전체보기</MoreText></TouchableOpacity>
        </SectionHeader>

        {/* 🌟 [수정 완료] 알림이 없을 때는 박스 없이 텍스트만 표시 / 있을 때만 기존 NotificationItem 컴포넌트를 맵핑해 순정 UI 그대로 보임 */}
        {notifications.length === 0 ? (
          <Text style={{ color: '#8A8D90', fontSize: 15, fontWeight: '500', textAlign: 'center', marginVertical: 30 }}>
            알림이 없습니다.
          </Text>
        ) : (
          notifications.map((noti) => (
            <NotificationItem 
              key={noti.id} 
              isUrgent={noti.isUrgent} 
              backgroundColor={noti.backgroundColor}
            >
              <NotiPoint backgroundColor={noti.isUrgent ? "#FF6B6B" : "#BBB"} />
              <NotiContent>
                <NotiText 
                  fontSize={16} 
                  isUrgent={noti.isUrgent} 
                  color="#1A1C1E"
                >
                  {noti.text}
                </NotiText>
                <NotiTime fontSize={14} color="#1A1C1E">{noti.time}</NotiTime>
              </NotiContent>
            </NotificationItem>
          ))
        )}

        {/* 환자 추가 버튼 */}
        <AddPatientButton
          activeOpacity={0.6}
          onPress={() => router.push("/caregiver_add_patient")}
        >
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

// --- 스타일 정의 (Styled-Components - 기존 구조 100% 동일) ---

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
  justify-content: center;
  align-items: center;
`;