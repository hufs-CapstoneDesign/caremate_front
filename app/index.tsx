import { router } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
} from "react-native";
// 벡터 아이콘 사용을 위해 추가
import { Heart } from 'lucide-react-native';
// 안전한 로컬 저장소를 위해 expo-secure-store 임포트
import * as SecureStore from "expo-secure-store";
// 🌟 우리가 만든 공통 API 함수 임포트!
import { requestWithToken } from '../services/api';

export default function StartScreen() {

  // 🌟 보호자 앱 시작 버튼 클릭 시 (수정된 핵심 로직!)
  const handleCaregiverStart = async () => {
    try {
      const role = await SecureStore.getItemAsync("userRole");
      const token = await SecureStore.getItemAsync("guardianToken");

      // 보호자로 등록된 토큰 정보가 존재할 때만 서버 검증을 수행
      if (role === "GUARDIAN" && token) {
        // [api.js 사용] 서버에 토큰이 진짜 유효한지 검증 요청을 보냅니다.
        const response = await requestWithToken("auth/validate", {});

        // 서버에서 유효한 로그인 토큰이라고 인정하면 바로 보호자 메인 화면으로 이동
        if (response && response.isValid) { 
          router.push("/caregiver_main");
          return;
        }
      }
      
      // 🌟 [요구사항 반영] 토큰이 없거나 유효하지 않다면 새로 만든 보호자 로그인 화면으로 이동
      router.push("/caregiver_login"); 
    } catch (error) {
      console.error("보호자 토큰 검증 실패:", error);
      // 안전하게 에러가 났을 때도 로그인 화면으로 유도합니다.
      router.push("/caregiver_login");
    }
  };

  // 🌟 환자 앱 시작 버튼 클릭 시 (기존 코드 100% 그대로 유지)
  const handlePatientStart = async () => {
    try {
      const role = await SecureStore.getItemAsync("userRole");
      const token = await SecureStore.getItemAsync("patientToken");

      if (role === "PATIENT" && token) {
        // 🌟 [api.js 사용] 서버에 토큰이 진짜 유효한지 검증 요청을 보냅니다.
        const response = await requestWithToken("auth/validate", {});

        if (response.isValid) { // 서버가 유효하다고 응답하면
          router.push("/patient_main");
          return;
        }
      }
      
      // 토큰이 없거나 유효하지 않다면 연동 코드 입력창으로 이동
      router.push("/patient_connect_code");
    } catch (error) {
      console.error("환자 토큰 검증 실패:", error);
      router.push("/patient_connect_code");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.logoSection}>
        <View style={styles.logoBox}>
          <Heart size={50} color="#4A90E2" fill="#4A90E2" fillOpacity={0.2} />
        </View>
        
        <Text style={styles.title}>케어메이트</Text>
        <Text style={styles.subtitle}>AI 어르신 케어</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>
            AI가 매일 어르신과 대화하며{"\n"}
            상태를 확인하고, 일일 레포트를 생성합니다.
          </Text>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={styles.loginCard} 
          onPress={handleCaregiverStart}
        >
          <View style={[styles.iconBox, { backgroundColor: "#EBF5FF" }]}>
            <Text style={styles.icon}>🛡️</Text>
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>보호자 앱 시작하기</Text>
            <Text style={styles.cardDesc}>어르신의 상태 레포트를 확인합니다.</Text>
          </View>
          <Text style={styles.arrow}>&gt;</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginCard} 
          onPress={handlePatientStart} 
        >
          <View style={[styles.iconBox, { backgroundColor: "#E8F5E9" }]}>
            <Text style={styles.icon}>👵</Text>
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>환자 앱 시작하기</Text>
            <Text style={styles.cardDesc}>AI 케어봇과 일일 통화를 진행합니다.</Text>
          </View>
          <Text style={styles.arrow}>&gt;</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 60,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginLeft: 10, 
    marginRight: 10
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 28,
  },
  cardTextBox: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1C1E",
  },
  cardDesc: {
    fontSize: 13,
    color: "#8E9AA7",
    marginTop: 4,
  },
  arrow: {
    fontSize: 18,
    fontWeight: "600",
    color: "#CDD4DB",
    marginRight: 4,
  },
});