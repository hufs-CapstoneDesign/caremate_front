import { Audio } from 'expo-av';
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { voiceSocket } from '../constants/socket';

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
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // 녹음기 인스턴스를 직접 추적하기 위한 Ref
  const recordingRef = useRef<Audio.Recording | null>(null);

  // 1. 애니메이션 로직
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

  // 2. 초기 설정 및 클린업 (화면 나갈 때 종료)
  useEffect(() => {
    async function setup() {
      const response = await Audio.requestPermissionsAsync();
      if (response.status !== 'granted') {
        console.log('마이크 권한이 거부되었습니다.');
      }
    }
    setup();

    // 화면을 나갈 때(Unmount) 실행되는 클린업 함수
    return () => {
      if (recordingRef.current) {
        console.log("화면을 나갑니다. 녹음기를 강제로 종료합니다.");
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // 3. 상태(Status) 변화에 따른 자동 녹음 시작/중지
  useEffect(() => {
    if (status === "listening") {
      startRecording();
    } else {
      stopRecording();
    }
  }, [status]);

  // 4. 녹음 시작 함수
  async function startRecording() {
    try {
      // 이미 녹음 중이라면 중복 실행 방지
      if (recordingRef.current) return;

      console.log('녹음 준비 중...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      recordingRef.current = newRecording; // Ref에 저장 (클린업용)
      console.log('녹음 시작됨');
    } catch (err) {
      console.error('녹음 시작 실패:', err);
    }
  }

  // 5. 녹음 중지 함수
  async function stopRecording() {
    if (!recordingRef.current) return;

    try {
      console.log('녹음 중지 중...');
      const targetRecording = recordingRef.current;
      recordingRef.current = null; // Ref 비우기
      setRecording(null);

      await targetRecording.stopAndUnloadAsync();
      const uri = targetRecording.getURI();
      console.log('녹음 완료, 파일 위치:', uri);

      // TODO: 서버 전송 로직 (FileSystem 등을 통해 읽어서 소켓 전송)
    } catch (err) {
      console.error('녹음 중지 실패:', err);
    }
  }

  // 6. 소켓 메시지 수신 처리
  useEffect(() => {
    const ws = voiceSocket as any;
    if (ws) {
      ws.onmessage = (event: any) => {
        if (event.data instanceof ArrayBuffer) {
          console.log("AI 음성 수신:", event.data.byteLength);
          setStatus("speaking");
        }
      };
    }
    return () => {
      if (ws) ws.onmessage = null;
    };
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

        <TouchableOpacity 
          style={styles.endButton} 
          onPress={() => router.push("/patient_main")}
        >
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

// 기존 스타일 시트는 그대로 유지하세요!
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A" },
  topBar: { flexDirection: "row", justifyContent: "space-between", padding: 50, paddingTop: 60 },
  statusLeft: { flexDirection: "row", alignItems: "center" },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80", marginRight: 8 },
  topText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  timer: { color: "#FFF", fontSize: 16, opacity: 0.6 },
  centerArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarOuter: { width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(74, 222, 128, 0.1)", alignItems: "center", justifyContent: "center" },
  avatarInner: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#4ADE80", alignItems: "center", justifyContent: "center" },
  botEmoji: { fontSize: 50 },
  title: { color: "#FFF", fontSize: 28, fontWeight: "700", marginTop: 24 },
  subtitle: { color: "#FFF", fontSize: 18, opacity: 0.7, marginTop: 8 },
  voiceBox: { marginTop: 40, height: 40, justifyContent: "center" },
  voiceDots: { color: "#4ADE80", fontSize: 24, letterSpacing: 4 },
  bottomArea: { paddingBottom: 60, alignItems: "center" },
  speakerButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  speakerIcon: { fontSize: 24 },
  speakerText: { color: "#FFF", opacity: 0.6, marginBottom: 40 },
  endButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FF4444", alignItems: "center", justifyContent: "center", transform: [{ rotate: "135deg" }] },
  endIcon: { fontSize: 32, color: "#FFF" },
  testButtons: { flexDirection: "row", marginTop: 20, gap: 20 },
  testText: { color: "#FFF", opacity: 0.3 }
});