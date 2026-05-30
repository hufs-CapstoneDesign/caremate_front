import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Heart } from 'lucide-react-native';
import * as SecureStore from "expo-secure-store";
import { registerAndSendFcmToken } from "../utils/fcm"; 

export default function StartScreen() {
  // 🌟 상태 변수명을 isLoading 하나로만 확실하게 통일합니다.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);


  // ⏳ 토큰 검사 중일 때 도는 로딩 스피너
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FB" }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Heart size={44} color="#4A90E2" fill="#4A90E2" />
        </View>
        <Text style={styles.title}>마음연결</Text>
        <Text style={styles.subtitle}>실시간 AI 부모님 케어 서비스</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>
            부모님의 말벗이 되어드리는 AI 케어봇과{"\n"}실시간 상태 알림을 통해 소중한 가족을 지키세요.
          </Text>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={styles.loginCard}
          onPress={async () => {
            const caregiverToken = await SecureStore.getItemAsync("userToken");
            if (caregiverToken) {
              router.replace("/caregiver_main");
            } else {
              router.push("/caregiver_login");
            }
          }}
        >
          <View style={[styles.iconCircle, { backgroundColor: "rgba(74, 144, 226, 0.1)" }]}>
            <Heart size={24} color="#4A90E2" />
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>보호자 앱 시작</Text>
            <Text style={styles.cardDesc}>부모님 상태 조회 및 푸시 알림 수신</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loginCard, { borderColor: "#EEF0F4", borderWidth: 1 }]}
          onPress={async () => {
            const patientToken = await SecureStore.getItemAsync("patientToken");
            if (patientToken) {
              router.replace("/patient_main");
            } else {
               router.push("/patient_connect_code");
            }
         }}
        >
          <View style={[styles.iconCircle, { backgroundColor: "rgba(74, 226, 144, 0.1)" }]}>
            <Heart size={24} color="#4ADE80" />
          </View>
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>환자(어르신) 앱 시작</Text>
            <Text style={styles.cardDesc}>AI 케어봇 말벗 통화 기능 제공</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB", justifyContent: "space-between", paddingVertical: 40 },
  topSection: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  logoContainer: { width: 90, height: 90, borderRadius: 32, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", marginBottom: 24, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  title: { fontSize: 32, fontWeight: "800", color: "#1A1C1E", marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: "600", color: "#4A90E2", marginBottom: 20 },
  descriptionBox: { backgroundColor: "rgba(74, 144, 226, 0.05)", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15 },
  description: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 22 },
  buttonSection: { gap: 16, paddingHorizontal: 24 },
  loginCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 },
  iconCircle: { width: 52, height: 52, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  cardTextBox: { flex: 1, marginLeft: 16 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#1A1C1E" },
  cardDesc: { fontSize: 13, color: "#718096", marginTop: 4, fontWeight: "500" }
});