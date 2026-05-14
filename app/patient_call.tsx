import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CallStatus = "connecting" | "listening" | "speaking";

const statusText = {
  connecting: {
    top: "연결 중",
    main: "AI 케어봇",
    sub: "연결하고 있어요...",
    dots: "••••••",
  },
  listening: {
    top: "통화 중",
    main: "AI 케어봇",
    sub: "듣는 중...",
    dots: "••••••••••••••",
  },
  speaking: {
    top: "통화 중",
    main: "AI 케어봇",
    sub: "말하는 중...",
    dots: "▂ ▃ ▅ ▇ ▅ ▃ ▂",
  },
};

export default function CallScreen() {
  const [status, setStatus] = useState<CallStatus>("listening");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const current = statusText[status];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.statusLeft}>
          <View style={styles.greenDot} />
          <Text style={styles.topText}>{current.top}</Text>
        </View>
        <Text style={styles.timer}>00:17</Text>
      </View>

      <View style={styles.centerArea}>
        <Animated.View
          style={[
            styles.avatarOuter,
            status !== "connecting" && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.avatarInner}>
            <Text style={styles.botEmoji}>🤖</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>{current.main}</Text>
        <Text style={styles.subtitle}>{current.sub}</Text>

        <View style={styles.voiceBox}>
          <Text style={styles.voiceDots}>{current.dots}</Text>
        </View>
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.speakerButton}>
          <Text style={styles.speakerIcon}>🔊</Text>
        </TouchableOpacity>
        <Text style={styles.speakerText}>스피커</Text>

        <TouchableOpacity style={styles.endButton} onPress={() => router.push("/patient_main")}>
          <Text style={styles.endIcon}>📞</Text>
        </TouchableOpacity>

        <View style={styles.testButtons}>
          <TouchableOpacity onPress={() => setStatus("connecting")}>
            <Text style={styles.testText}>연결</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStatus("listening")}>
            <Text style={styles.testText}>듣기</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStatus("speaking")}>
            <Text style={styles.testText}>말하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D3145",
    paddingHorizontal: 30,
    paddingTop: 55,
    paddingBottom: 35,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  greenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#57E0C7",
    marginRight: 12,
  },
  topText: {
    color: "#5DE4D1",
    fontSize: 20,
    fontWeight: "700",
  },
  timer: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(210,225,245,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 44,
  },
  avatarInner: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "#EFFFFB",
    alignItems: "center",
    justifyContent: "center",
  },
  botEmoji: {
    fontSize: 64,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 12,
  },
  subtitle: {
    color: "#D8E3EE",
    fontSize: 20,
    marginBottom: 36,
  },
  voiceBox: {
    width: 220,
    height: 108,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceDots: {
    color: "#58C9C8",
    fontSize: 28,
    letterSpacing: 4,
  },
  bottomArea: {
    alignItems: "center",
  },
  speakerButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  speakerIcon: {
    fontSize: 34,
  },
  speakerText: {
    color: "#B9C8D8",
    fontSize: 16,
    marginBottom: 34,
  },
  endButton: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "#FF5F7E",
    alignItems: "center",
    justifyContent: "center",
  },
  endIcon: {
    fontSize: 42,
    transform: [{ rotate: "135deg" }],
  },
  testButtons: {
    flexDirection: "row",
    gap: 18,
    marginTop: 20,
  },
  testText: {
    color: "#9FEBDD",
    fontSize: 13,
  },
});
