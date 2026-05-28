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
// 🌟 안전한 로컬 저장소를 위해 expo-secure-store 임포트
import * as SecureStore from "expo-secure-store";

export default function StartScreen() {

  // 🌟 환자 앱 시작 버튼 클릭 시 분기 처리 함수
  const handlePatientStart = async () => {
    try {
      // 1. 기기 내부 금고에서 기존에 저장된 인증 토큰이 있는지 조회합니다.
      const token = await SecureStore.getItemAsync("userToken");
      const role = await SecureStore.getItemAsync("userRole");

      // 2. 토큰이 존재하고 역할이 환자('patient')로 등록되어 있다면 자동 로그인 처리
      if (token && role === "patient") {
        router.push("/patient_main");
      } else {
        // 3. 인증 토큰이 없다면 연동 절차를 밟아야 하므로 코드 입력창으로 이동
        router.push("/patient_connect_code");
      }
    } catch (error) {
      console.error("인증 토큰 조회 실패:", error);
      // 예외 발생 시 안전하게 코드 입력 화면으로 안내합니다.
      router.push("/patient_connect_code");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.logoSection}>
        {/* 뇌 이모지 대신 세련된 벡터 아이콘으로 교체 */}
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
          onPress={() => router.push("/caregiver_main")}
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
          onPress={handlePatientStart} // 🌟 분기 처리 함수 적용
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