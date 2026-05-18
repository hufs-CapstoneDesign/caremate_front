import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function PatientMain() {
  // 1. 현재 시간 상태 관리 추가
  const [now, setNow] = useState(new Date());

  // 2. 1초마다 시간을 업데이트하는 타이머 설정
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer); // 메모리 누수 방지
  }, []);

  // 3. 시간 포맷팅 (예: 15:35)
  const timeString = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // 4. 날짜 포맷팅 (예: 2026년 5월 18일 (월))
  const dateString = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${now.toLocaleDateString("ko-KR", { weekday: 'short' })})`;
  const handleStartConsultation = () => {
    router.push("/patient_call");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요,</Text>
        <Text style={styles.name}>김순자 어르신</Text>
        <View style={styles.timeBox}>
          {/* 고정값이 아닌 변수 적용 */}
          <Text style={styles.time}>{timeString}</Text>
          <Text style={styles.date}>{dateString}</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[styles.cardPrimary, styles.loginCard]}
          onPress={handleStartConsultation}
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
          onPress={() => router.push("/patient_incoming_call")}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
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
  date: { 
    color: "white", 
    marginTop: 10,
    fontSize: 30,       // [수정] 글자 크기를 24로 키움
    fontWeight: "600",  // [추가] 글자를 조금 더 두껍게 설정
    textAlign: "center" // [추가] 시간과 정렬을 맞춤
  },
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
