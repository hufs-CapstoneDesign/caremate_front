import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, StatusBar } from "react-native";

export default function PatientMain() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${now.toLocaleDateString("ko-KR", { weekday: 'short' })})`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 상단 헤더: 리포트 화면의 깔끔한 배경과 대비되는 포인트 컬러 섹션 */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View>
            <Text style={styles.greeting}>안녕하세요,</Text>
            <Text style={styles.name}>김순자 어르신</Text>
          </View>
        </View>

        <View style={styles.timeBox}>
          <Text style={styles.time}>{timeString}</Text>
          <Text style={styles.date}>{dateString}</Text>
        </View>
      </View>

      {/* 하단 카드 영역: 리포트 및 시작화면과 동일한 화이트 라운드 카드 스타일 */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.mainCallCard}
          onPress={() => router.push("/patient_call")}
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
        
        {/* 테스트용 버튼: 디자인 시스템에 맞춰 보조 카드로 변경 */}
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
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#E8F5E9" // 환자용 고유 포인트 컬러 유지
  },
  header: { 
    paddingTop: 40, 
    paddingHorizontal: 25, 
    paddingBottom: 40 
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
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
    backgroundColor: "#F8F9FB", // 리포트 배경색과 일치
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
    // 리포트 DetailCard 그림자 스타일 일치
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
});