import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* 상단 영역 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요,</Text>
        <Text style={styles.name}>김순자 어르신</Text>

        <View style={styles.timeBox}>
          <Text style={styles.period}>오후</Text>
          <Text style={styles.time}>1:34</Text>
          <Text style={styles.date}>2026년 4월 29일 (수)</Text>
        </View>
      </View>

      {/* 카드 영역 */}
      <View style={styles.cardContainer}>
        {/* AI에게 전화하기 */}
        <TouchableOpacity style={styles.cardPrimary}>
          <Ionicons name="call-outline" size={28} color="white" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>AI에게 전화하기</Text>
            <Text style={styles.cardDesc}>언제든지 말을 걸어보세요</Text>
          </View>
        </TouchableOpacity>

        {/* 전화 받기 */}
        <TouchableOpacity style={styles.cardSecondary}>
          <Ionicons name="call-outline" size={28} color="white" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>전화 받기 (데모)</Text>
            <Text style={styles.cardDesc}>AI가 전화 거는 화면 보기</Text>
          </View>
        </TouchableOpacity>

        {/* 하단 설명 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            AI 케어봇이 매일 정해진 시간에 전화를 드립니다. 편하게 이야기
            나눠주세요!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0FA67A",
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  greeting: {
    color: "white",
    fontSize: 18,
  },
  name: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
  },
  timeBox: {
    alignItems: "center",
    marginBottom: 40,
  },
  period: {
    color: "white",
    fontSize: 14,
  },
  time: {
    color: "white",
    fontSize: 64,
    fontWeight: "bold",
  },
  date: {
    marginTop: 10,
    color: "white",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
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
    marginBottom: 15,
  },

  cardSecondary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0CA678",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },

  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  cardDesc: {
    color: "white",
    opacity: 0.8,
  },

  infoBox: {
    backgroundColor: "#E9ECEF",
    padding: 16,
    borderRadius: 16,
  },

  infoText: {
    color: "#555",
    textAlign: "center",
  },
});
