import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, StatusBar, Alert } from "react-native";
import * as Device from "expo-device";
// 🌟 1. SecureStore 라이브러리 임포트 추가
import * as SecureStore from 'expo-secure-store'; 
import { registerAndSendFcmToken } from "../utils/fcm"; 

export default function PatientMain() {
  const [now, setNow] = useState(new Date());
  
  // 🌟 2. 동적 처리를 위한 환자 ID 및 이름 상태(State) 선언
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>("어르신");

  // 시간 갱신 타이머 (기존 유지)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🌟 3. 화면 진입 시 기기 저장소에서 정보를 꺼내고 FCM 동기화까지 순서대로 처리
  useEffect(() => {
    const initPatientSession = async () => {
      let currentId = null;

      try {
        // ① 기기 저장소(SecureStore)에 담긴 실제 연동 데이터 획득
        const savedId = await SecureStore.getItemAsync("CONNECTED_PATIENT_ID"); // 보호자 세션 변수명과 일치 처리
        const savedName = await SecureStore.getItemAsync("CONNECTED_PATIENT_NAME");
        
        if (savedId) {
          setPatientId(savedId);
          currentId = savedId; // FCM 동기화에 바로 사용하기 위해 캐싱
        }
        if (savedName) {
          setPatientName(savedName);
        }
      } catch (error) {
        console.error("❗ 기기 저장소에서 환자 정보를 가져오지 못했습니다:", error);
      }

      // ② 에뮬레이터나 시뮬레이터 예외 체크 
      if (!Device.isDevice) {
        console.log("알림은 실제 기기(물리 디바이스)에서 테스트해야 합니다.");
        return;
      }

      // ③ 위에서 성공적으로 식별자(ID)를 확보한 경우에만 안전하게 FCM 등록 연동
      if (currentId) {
        try {
          await registerAndSendFcmToken(currentId, "PATIENT");
          console.log(`✅ 환자용 FCM 토큰 동기화 완료 (ID: ${currentId})`);
        } catch (error) {
          console.error("환자 메인 FCM 등록 중 오류 발생:", error);
        }
      } else {
        console.log("⚠️ 저장된 PATIENT_ID가 없어 FCM 토큰 동기화를 건너뜁니다.");
      }
    };

    initPatientSession();
  }, []);

  // 🌟 [신규 추가] 환자 앱 로그아웃 처리 함수
  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?\n로그아웃 시 기존 연동이 해제됩니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: async () => {
            try {
              // 저장된 환자 연동 정보 일괄 삭제
              await SecureStore.deleteItemAsync("CONNECTED_PATIENT_ID");
              await SecureStore.deleteItemAsync("CONNECTED_PATIENT_NAME");
              await SecureStore.deleteItemAsync("userRole");
              
              Alert.alert("로그아웃", "정상적으로 로그아웃 되었습니다.");
              // 앱 첫 화면(인덱스)으로 튕겨내기
              router.replace("/");
            } catch (error) {
              console.error("환자 로그아웃 실패:", error);
              Alert.alert("에러", "로그아웃 처리에 실패했습니다.");
            }
          }
        }
      ]
    );
  };

  // 🌟 4. 전화하기 버튼 클릭 시 가드 처리 핸들러 추가
  const handleCallPress = () => {
    if (!patientId) {
      Alert.alert("안내", "인증 정보가 동기화되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    // 데이터 보장이 완료되면 안전하게 통화 화면 진입
    router.push("/patient_call");
  };

  const timeString = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${now.toLocaleDateString("ko-KR", { weekday: 'short' })})`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 상단 헤더 영역 */}
      <View style={styles.header}>
        {/* 🌟 로그아웃 아이콘 배치를 위해 가로 정렬(Row) 구조 적용 */}
        <View style={styles.profileRow}>
          <View>
            <Text style={styles.greeting}>안녕하세요,</Text>
            {/* 🌟 5. 하드코딩 문구를 제거하고 동적 {patientName} 변수 매칭 */}
            <Text style={styles.name}>{patientName} 어르신</Text>
          </View>
          
          {/* 🌟 [신규 추가] 우측 상단 순정 로그아웃 버튼 컴포넌트 */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={28} color="#1A1C1E" />
          </TouchableOpacity>
        </View>

        <View style={styles.timeBox}>
          <Text style={styles.time}>{timeString}</Text>
          <Text style={styles.date}>{dateString}</Text>
        </View>
      </View>

      {/* 하단 카드 영역 */}
      <View style={styles.cardContainer}>
        {/* 🌟 6. 기존 라우터 다이렉트 푸시 대신 안전 장치가 마련된 핸들러 호출로 전환 */}
        <TouchableOpacity
          style={styles.mainCallCard}
          onPress={handleCallPress}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="call" size={32} color="#0FA67A" />
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>AI에게 전화하기</Text>
            <Text style={styles.cardDesc}>언제든지 말을 걸어보세요</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#0FA67A" />
        </TouchableOpacity>

        {/* 테스트용 버튼 */}
        <TouchableOpacity
          style={styles.subTestCard}
          onPress={() => router.push("/patient_incoming_call")}
        >
          <Ionicons name="settings-outline" size={20} color="#718096" />
          <Text style={styles.subTestText}>수신 화면 UI 테스트</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#E8F5E9" 
  },
  header: { 
    paddingTop: 40, 
    paddingHorizontal: 25, 
    paddingBottom: 40 
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // 로그아웃 아이콘과 글씨 정렬선 정돈
    marginBottom: 40,
  },
  // 🌟 [신규 추가] 순정 로그아웃 버튼 터치 영역 스타일링
  logoutButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 50,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  greeting: { color: "#1A1C1E", fontSize: 18, fontWeight: "500" },
  name: { color: "#1A1C1E", fontSize: 32, fontWeight: "800", marginTop: 4 },
  timeBox: { alignItems: "center" },
  time: { color: "#1A1C1E", fontSize: 72, fontWeight: "800", letterSpacing: -1 },
  date: { 
    color: "#1A1C1E", 
    marginTop: 8,
    fontSize: 22,
    fontWeight: "600",
  },
  cardContainer: {
    flex: 1, margin: 10,
    backgroundColor: "#F8F9FB", 
    borderRadius: 35,
    padding: 25,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  mainCallCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextBox: { flex: 1, marginLeft: 20 },
  cardTitle: { color: "#1A1C1E", fontSize: 22, fontWeight: "800" },
  cardDesc: { color: "#718096", fontSize: 15, marginTop: 4, fontWeight: "500" },
  
  subTestCard: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#E2E8F0",
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
  },
  subTestText: { 
    color: "#4A5568", 
    fontSize: 14, 
    fontWeight: "700" 
  },
  connectCard: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  connectIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#EEF5FF",
    justifyContent: "center",
    alignItems: "center",
  },
});