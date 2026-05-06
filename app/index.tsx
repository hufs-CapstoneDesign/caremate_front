import { router } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StartScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("/call")}>
        <Text>통화 화면 테스트</Text>
      </TouchableOpacity>
      <StatusBar barStyle="light-content" />

      <View style={styles.logoSection}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🧠</Text>
        </View>

        <Text style={styles.title}>케어메이트</Text>
        <Text style={styles.subtitle}>Caremate · AI 치매 케어</Text>
        <Text style={styles.description}>
          AI가 매일 어르신과 대화하며{"\n"}
          건강 상태를 자동으로 기록합니다
        </Text>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.loginCard}>
          <View style={styles.guardianIconBox}>
            <Text style={styles.cardIcon}>🛡️</Text>
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>보호자 로그인</Text>
            <Text style={styles.cardSub}>리포트 확인 및 환자 관리</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={styles.patientIconBox}>
            <Text style={styles.cardIcon}>👤</Text>
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>환자 로그인</Text>
            <Text style={styles.patientSub}>AI와 대화 및 통화 기능</Text>
          </View>

          <Text style={styles.patientArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>V1.0.0 · CAREMATE DEMO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25246F",
    paddingHorizontal: 30,
    paddingTop: 120,
    paddingBottom: 45,
    justifyContent: "space-between",
  },
  logoSection: {
    alignItems: "center",
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 36,
  },
  logoIcon: {
    fontSize: 54,
  },
  title: {
    fontSize: 44,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 18,
  },
  subtitle: {
    fontSize: 18,
    color: "#E5E7FF",
    marginBottom: 28,
  },
  description: {
    fontSize: 16,
    color: "#9EA6E8",
    textAlign: "center",
    lineHeight: 27,
  },
  buttonSection: {
    gap: 18,
  },
  loginCard: {
    height: 110,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  guardianIconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#5856D6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 22,
  },
  patientIconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#287E91",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 22,
  },
  cardIcon: {
    fontSize: 30,
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardSub: {
    color: "#D5D9FF",
    fontSize: 15,
  },
  patientSub: {
    color: "#9FF5C8",
    fontSize: 15,
  },
  arrow: {
    color: "#B9C0FF",
    fontSize: 42,
    fontWeight: "300",
  },
  patientArrow: {
    color: "#65E6A0",
    fontSize: 42,
    fontWeight: "300",
  },
  footer: {
    color: "rgba(255,255,255,0.28)",
    textAlign: "center",
    fontSize: 13,
    letterSpacing: 1,
  },
});
