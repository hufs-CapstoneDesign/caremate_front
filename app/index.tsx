import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
} from "react-native";
import { Heart } from 'lucide-react-native';
import * as SecureStore from "expo-secure-store";
// 🌟 이미 만들어두신 fcm 모듈 임포트 (경로는 프로젝트 구조에 맞게 살짝 조절 가능)
import { registerAndSendFcmToken } from "../utils/fcm"; 

export default function StartScreen() {

  // 앱이 켜질 때 자동 로그인 체크
  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        
        // 🌟 로컬 저장소에 토큰이 존재할 때만 (자동 로그인) FCM 등록을 수행!
        if (token) {
          // utils/fcm.ts 의 함수 호출시 유저타입 "CAREGIVER" 함께 전달
          await registerAndSendFcmToken(token, "CAREGIVER");
          router.replace("/caregiver_main");
        }
      } catch (error) {
        console.error("자동 로그인 체크 및 FCM 등록 중 에러 발생:", error);
      }
    };

    checkAutoLogin();
  }, []);

  // 보호자 앱 시작 버튼 클릭 시
  const handleCaregiverStart = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");

      if (token) {
        // 🌟 로그인 기록이 이미 있다면 화면 진입 전 FCM 토큰 동기화
        await registerAndSendFcmToken(token, "CAREGIVER");
        router.push("/caregiver_main");
      } else {
        router.push("/caregiver_login");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("에러", "앱 시작 중 오류가 발생했습니다.");
    }
  };

  // 피보호자(어르신) 앱 시작 버튼 클릭 시
  const handlePatientStart = async () => {
    try {
      // 🌟 기기에 저장된 환자 연동 정보(ID)가 있는지 확인합니다.
      const savedPatientId = await SecureStore.getItemAsync("CONNECTED_PATIENT_ID");
      
      if (savedPatientId) {
        // 1. 이미 코드를 입력해서 연동된 환자라면 기존처럼 메인으로 바로 진입
        router.push("/patient_main");
      } else {
        // 2. 코드를 입력하지 않은 상태라면 코드 입력 화면(patient_connect_code)으로 강제 이동
        router.push("/patient_connect_code");
      }
    } catch (error) {
      console.error("환자 연동 상태 확인 중 오류 발생:", error);
      // 에러 시 안전하게 입력 화면으로 유도
      router.push("/patient_connect_code");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.innerContainer}>
        {/* 상단 브랜딩 섹션 */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Heart size={44} color="#FFF" />
          </View>
          <Text style={styles.title}>Caremate</Text>
          <Text style={styles.subtitle}>AI 어르신 케어 서비스</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.description}>
              인공지능 기술을 통해 어르신의 안부를 묻고{"\n"}
              보호자에게 소중한 일상을 일일 리포트로 전달합니다.
            </Text>
          </View>
        </View>

        {/* 버튼 섹션 */}
        <View style={styles.buttonSection}>
          {/* 보호자용 카드 버튼 */}
          <TouchableOpacity style={styles.loginCard} onPress={handleCaregiverStart}>
            <View style={[styles.iconBadge, { backgroundColor: "#4A90E2" }]}>
              <Text style={styles.badgeText}>보호자</Text>
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>보호자 시작하기</Text>
              <Text style={styles.cardSubtitle}>어르신 상태 모니터링 및 AI 레포트 조회</Text>
            </View>
          </TouchableOpacity>

          {/* 피보호자용 카드 버튼 */}
          <TouchableOpacity style={styles.loginCard} onPress={handlePatientStart}>
            <View style={[styles.iconBadge, { backgroundColor: "#4ADE80" }]}>
              <Text style={styles.badgeText}>어르신</Text>
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>어르신 모드 시작하기</Text>
              <Text style={styles.cardSubtitle}>AI와 대화를 통해 일상 전달</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 40,
  },
  logoContainer: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A1C1E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 20,
  },
  descriptionBox: {
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonSection: {
    gap: 16,
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#F1F3F5",
  },
  iconBadge: {
    width: 65,
    height: 65,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1C1E",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#8E94A0",
    fontWeight: "500",
  },
});