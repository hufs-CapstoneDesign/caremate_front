import { router } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
// 벡터 아이콘 사용을 위해 추가
import { Heart } from 'lucide-react-native';

export default function StartScreen() {
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
          <View style={[styles.iconBox, { backgroundColor: '#EEF5FF' }]}>
            <Text style={styles.cardIcon}>🛡️</Text>
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>보호자 로그인</Text>
            <Text style={styles.cardSub}>리포트 확인 및 환자 관리</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginCard} 
          onPress={() => router.push("/patient_main")}
        >
          <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.cardIcon}>👤</Text>
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>환자 로그인</Text>
            <Text style={styles.cardSub}>AI와 대화 및 통화 기능</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>V1.0.0 · CAREMATE DEMO</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    paddingHorizontal: 25,
    justifyContent: "space-between",
    paddingVertical: 50,
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
    marginBottom: 24,
    // 그림자 효과로 입체감 부여
    elevation: 8,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
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
    marginLeft: 10, marginRight: 10
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitle: {
    color: "#1A1C1E",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSub: {
    color: "#8E8E93",
    fontSize: 14,
  },
  arrow: {
    color: "#D1D1D6",
    fontSize: 30,
    fontWeight: "300",
    marginLeft: 10,
  },
  footer: {
    color: "#C7C7CC",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1,
  },
});