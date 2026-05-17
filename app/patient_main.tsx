import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PatientMain() {
  // 3. 통화 시작 함수 (누르면 딜레이 없이 즉시 화면 이동)
  const handleStartConsultation = () => {
    // 💡 녹음 설정이나 서버 대기 없이 즉시 전화 화면으로 이동합니다.
    router.push("/patient_call");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요,</Text>
        <Text style={styles.name}>김순자 어르신</Text>
        <View style={styles.timeBox}>
          <Text style={styles.time}>1:34</Text>
          <Text style={styles.date}>2026년 4월 29일 (수)</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[styles.cardPrimary, styles.loginCard]}
          onPress={handleStartConsultation} // 👈 누르면 즉시 뜁니다!
        >
          <Ionicons name="call-outline" size={28} color="white" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>AI에게 전화하기</Text>
            <Text style={styles.cardDesc}>언제든지 말을 걸어보세요</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: "#4A5568",
            padding: 15,
            borderRadius: 10,
          }}
          onPress={() => router.push("/patient_incoming_call")} // 👈 수신 화면으로 강제 이동
        >
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            ⚙️ 수신 화면(Incoming Call) UI 테스트용 버튼
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0FA67A" },
  header: { paddingTop: 80, paddingHorizontal: 20 },
  greeting: { color: "white", fontSize: 18 },
  name: { color: "white", fontSize: 26, fontWeight: "bold" },
  timeBox: { alignItems: "center", marginBottom: 40 },
  time: { color: "white", fontSize: 64, fontWeight: "bold" },
  date: { color: "white", marginTop: 10 },
  cardContainer: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  cardPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#12B886",
    padding: 20,
    borderRadius: 20,
  },
  cardTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  cardDesc: { color: "white", opacity: 0.8 },
  loginCard: {
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
