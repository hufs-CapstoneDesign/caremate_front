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
// 벡터 아이콘 사용을 위해 추가
import { Heart } from 'lucide-react-native';
// 안전한 로컬 저장소를 위해 expo-secure-store 임포트
import * as SecureStore from "expo-secure-store";

export default function StartScreen() {

  // 🌟 앱이 켜질 때 자동 로그인 체크 (서버 검증 없이 로컬 토큰만 확인)
  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        // 로컬 저장소에 토큰이 존재하기만 하면 바로 메인 화면으로 이동
        if (token) {
          router.replace("/caregiver_main");
        }
      } catch (error) {
        console.error("자동 로그인 체크 중 에러 발생:", error);
      }
    };

    checkAutoLogin();
  }, []);

  // 🌟 보호자 앱 시작 버튼 클릭 시
  const handleCaregiverStart = async () => {
    try {
      // 서버 검증 단계를 생략하고, 로컬에 저장된 토큰이 있는지 바로 확인
      const token = await SecureStore.getItemAsync("userToken");

      if (token) {
        // 토큰이 이미 있다면 로그인 단계를 건너뛰고 메인 화면으로 이동
        router.push("/caregiver_main");
      } else {
        // 토큰이 없다면 로그인 화면으로 이동
        router.push("/caregiver_login");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("에러", "앱 시작 중 오류가 발생했습니다.");
    }
  };

  // 피보호자(어르신) 앱 시작 버튼 클릭 시 (기존 로직 유지)
  const handlePatientStart = () => {
    router.push("/patient_main");
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
          <Text style={styles.title}>마음연결</Text>
          <Text style={styles.subtitle}>AI 실버 케어 서비스</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.description}>
              인공지능 기술을 통해 어르신의 안부를 묻고{"\n"}
              보호자에게 소중한 일상을 실시간으로 전달합니다.
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
              <Text style={styles.cardTitle}>돌봄 파트너 시작하기</Text>
              <Text style={styles.cardSubtitle}>어르신 상태 모니터링 및 AI 레포트 조회</Text>
            </View>
          </TouchableOpacity>

          {/* 피보호자용 카드 버튼 */}
          <TouchableOpacity style={styles.loginCard} onPress={handlePatientStart}>
            <View style={[styles.iconBadge, { backgroundColor: "#4ADE80" }]}>
              <Text style={styles.badgeText}>어르신</Text>
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>시니어 모드 시작하기</Text>
              <Text style={styles.cardSubtitle}>말벗 AI 통화 및 긴급 호출 서비스 이용</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 🌟 UI 스타일시트 100% 동일하게 유지
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
    backgroundColor: "rgba(74, 144, 226, 0.05)\",",
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