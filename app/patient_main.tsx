import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, StatusBar, Alert } from "react-native";
import * as Device from "expo-device";
import * as SecureStore from 'expo-secure-store'; 
import { registerAndSendFcmToken } from "../utils/fcm"; 

export default function PatientMain() {
  // 🌟 now 상태 변수 정상 선언되어 있습니다! (빨간 줄 해결)
  const [now, setNow] = useState(new Date());
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>("어르신");

  // 시간 갱신 타이머
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 화면 진입 시 기기 저장소에서 정보를 꺼내고 FCM 동기화까지 순서대로 처리
  useEffect(() => {
    const initPatientSession = async () => {
      try {
        const savedId = await SecureStore.getItemAsync("CONNECTED_PATIENT_ID");
        const savedName = await SecureStore.getItemAsync("CONNECTED_PATIENT_NAME");
        
        console.log("💾 메인 화면 진입 - 로컬 저장소 확인:", { savedId, savedName });

        if (savedId) {
          setPatientId(savedId);
          
          if (Device.isDevice) {
            await registerAndSendFcmToken(savedId, "PATIENT");
            console.log(`✅ 환자용 FCM 토큰 동기화 완료 (ID: ${savedId})`);
          }
        }
        if (savedName) {
          setPatientName(savedName);
        }
      } catch (error) {
        console.error("❗ 기기 저장소에서 환자 정보를 가져오지 못했습니다:", error);
      }
    };

    initPatientSession();
  }, []); 

  // 환자 앱 로그아웃 처리 함수
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
              await SecureStore.deleteItemAsync("CONNECTED_PATIENT_ID");
              await SecureStore.deleteItemAsync("CONNECTED_PATIENT_NAME");
              await SecureStore.deleteItemAsync("userRole");
              await SecureStore.deleteItemAsync("patientToken"); // ✅ 이거 추가
              
              Alert.alert("로그아웃", "정상적으로 로그아웃 되었습니다.");
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

  // 전화하기 버튼 클릭 시 이중 가드 처리 핸들러
  const handleCallPress = async () => {
    if (!patientId) {
      console.log("⚠️ 상태값이 비어있어 저장소 직접 조회를 시도합니다.");
      const urgentCheckId = await SecureStore.getItemAsync("CONNECTED_PATIENT_ID");
      
      if (urgentCheckId) {
        setPatientId(urgentCheckId);
        router.push("/patient_call");
        return;
      }

      Alert.alert("안내", "인증 정보가 존재하지 않습니다. 다시 로그인(코드 입력)을 진행해 주세요.");
      return;
    }

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
        <View style={styles.profileRow}>
          <View>
            <Text style={styles.greeting}>안녕하세요,</Text>
            <Text style={styles.name}>{patientName} 어르신</Text>
          </View>
          
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
} // 🌟 PatientMain 컴포넌트가 여기서 정상적으로 닫힙니다.

// --- 스타일 정의 영역 (styles 객체가 완벽히 선언되어 빨간 줄 해결) ---
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
    alignItems: 'center',
    marginBottom: 40,
  },
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