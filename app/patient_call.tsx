import { encode as base64Encode } from "base-64";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router"; 
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert, 
} from "react-native";
import { startSession, endSession, fetchPatientInfoForPatient } from "../services/api.js"; 

type CallStatus = "connecting" | "listening" | "speaking";

const SILENCE_LIMIT_MS = 2000;
const METERING_INTERVAL_MS = 250;
const SILENCE_THRESHOLD = -30; 

const statusText = {
  connecting: { top: "연결 중", main: "AI 케어봇", sub: "연결하고 있어요...", dots: "••••••" },
  listening: { top: "통화 중", main: "AI 케어봇", sub: "듣는 중...", dots: "••••••••••••••" },
  speaking: { top: "통화 중", main: "AI 케어봇", sub: "말하는 중...", dots: "▂ ▃ ▅ ▇ ▅ ▃ ▂" },
};

export default function CallScreen() {
  const params = useLocalSearchParams();
  const currentCallType = params.call_type || "voluntary";

  const [status, setStatus] = useState<CallStatus>("connecting");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string>("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const meteringTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastVoiceTimeRef = useRef<number>(Date.now());
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    startCall();
    return () => { cleanup(); };
  }, []);

  // --- API 및 통신 로직 ---

  async function startCall() {
    try {
      setStatus("connecting");
      console.log(`📱 [1단계: 통화 요청 시작] 백엔드로 세션 생성을 요청합니다... (타입: ${currentCallType})`);
    
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        console.error("마이크 권한 거부됨");
        Alert.alert("권한 오류", "마이크 권한 허용이 필요합니다.");
        return;
      }

      // auth/me API로 환자 본인의 user_id 조회
      const me = await fetchPatientInfoForPatient();
      const realPatientId = me?.user_id ?? null;
      console.log("🔑 API에서 로드한 실제 환자 ID:", realPatientId);

      if (!realPatientId) {
        Alert.alert("인증 오류", "환자 정보를 불러올 수 없습니다. 다시 로그인해 주세요.");
        router.back();
        return;
      }

      // 🌟 진짜 동적 ID를 실어서 통화 세션 요청을 발송합니다.
      const data = await startSession({
        call_type: currentCallType 
      });

      console.log("📥 [2단계: API 응답 수신 성공] 서버 응답 상태 데이터::", data);

      if (data) {
        // 🌟 백엔드가 세션 주머니 정보를 다채롭게 주더라도 낚아채도록 가드 구축
        const actualSessionId = data.session_id || data.sessionId || data.data?.session_id || data.data?.sessionId;
        const actualWsUrl = data.websocket_url || data.websocketUrl || data.data?.websocket_url || data.data?.websocketUrl;

        if (actualSessionId && actualWsUrl) {
          console.log("--------------------------------------------------");
          console.log("✨ [3단계: 세션 데이터 매칭 완료] 통화 연결을 수립합니다.");
          console.log(`   - 발급된 세션 ID : ${actualSessionId}`);
          console.log(`   - 웹소켓 연결 주소: ${actualWsUrl}`);
          console.log("--------------------------------------------------");

          setSessionId(actualSessionId);
          connectWebSocket(actualWsUrl);
        } else {
          console.log("⚠️ 필수 세션 정보 파싱 실패", { actualSessionId, actualWsUrl });
          Alert.alert("연결 실패", "통화 세션 필수 정보(ID/웹소켓 URL) 파싱에 실패했습니다.");
          router.back();
        }
      } else {
        Alert.alert("연결 실패", "통화 세션 필수 정보를 받아오지 못했습니다.");
        router.back();
      }
    } catch (error) {
      console.error("❌ [통화 에러] 1~3단계 통화 시작 단계 중 에러 발생:", error);
      Alert.alert("오류", "서버와 연결이 원활하지 않습니다. 다시 시도해 주세요.");
      router.back();
    }
  }

  function connectWebSocket(websocketUrl: string) {
    console.log("4. [WS 연결 시도]:", websocketUrl);
    const ws = new WebSocket(websocketUrl);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("✅ [WS 연결 성공]");
      socketRef.current = ws;
      startRecording();
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        console.log("📥 [텍스트 수신]:", event.data);
        if (event.data === "END") {
          console.log("🏁 대화 종료 신호 수신");
          return;
        }
        setAiMessage(event.data);
      } 
      else if (event.data instanceof ArrayBuffer) {
        console.log("📥 [음성 바이트 수신] 크기:", event.data.byteLength);
        await playBinaryAudio(event.data);
      }
    };
    ws.onerror = (error: any) => console.error("❌ [WS 오류 상세]:", error.message || error);
    ws.onclose = () => console.log("웹소켓 종료됨");
  }

  async function endCall() {
    try {
      console.log("5. [API 요청] 통화 종료 시도, 세션:", sessionId);
      await cleanup();

      if (sessionId) {
        const result = await endSession(sessionId);
        console.log("6. [종료 API 결과]:", result);
      }
      router.back();
    } catch (error) {
      console.error("❌ 통화 종료 실패:", error);
      router.back();
    }
  }

  // --- 녹음 및 음성 처리 로직 ---

  async function startRecording() {
    try {
      if (recordingRef.current || isProcessingRef.current) return;
      setStatus("listening");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      recordingRef.current = recording;
      lastVoiceTimeRef.current = Date.now();
      startSilenceDetection();
      console.log("녹음 시작됨");
    } catch (error) {
      console.error("녹음 시작 실패:", error);
    }
  }

  function startSilenceDetection() {
    if (meteringTimerRef.current) clearInterval(meteringTimerRef.current);
    meteringTimerRef.current = setInterval(async () => {
      const recording = recordingRef.current;
      if (!recording || isProcessingRef.current) return;
      try {
        const status = await recording.getStatusAsync();
        if (!status.isRecording) return;
        const metering = status.metering;

        console.log("🎤 현재 마이크 수치:", metering, "| 기준점:", SILENCE_THRESHOLD);

        if (typeof metering === "number") {
          if (metering > SILENCE_THRESHOLD) lastVoiceTimeRef.current = Date.now();
          if (Date.now() - lastVoiceTimeRef.current >= SILENCE_LIMIT_MS) {
            console.log("✅ 2초 침묵 감지 → 전송");
            await stopRecordingAndSend();
          }
        }
      } catch (e) { console.error("침묵 감지 에러:", e); }
    }, METERING_INTERVAL_MS);
  }

  async function stopRecordingAndSend() {
    if (!recordingRef.current) return;
    try {
      isProcessingRef.current = true;
      const recording = recordingRef.current;
      recordingRef.current = null;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("녹음 완료:", uri);
      if (uri) await sendRecordingToServer(uri);
    } catch (e) {
      console.error("녹음 처리 실패:", e);
      isProcessingRef.current = false;
      startRecording();
    }
  }

  async function sendRecordingToServer(uri: string) {
    try {
      const ws = socketRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.log("웹소켓 연결 없음");
        isProcessingRef.current = false;
        return;
      }

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64" as any, 
      });

      const binaryAudio = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      ws.send(binaryAudio); 
      console.log("✅ 순수 m4a 바이트 전송 완료");
    } catch (e) {
      console.error("❌ 서버 전송 에러:", e);
      isProcessingRef.current = false;
      startRecording();
    }
  }

  async function playBinaryAudio(arrayBuffer: ArrayBuffer) {
    try {
      setStatus("speaking");
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64Audio = base64Encode(binary);

      const fileUri = `${(FileSystem as any).cacheDirectory}ai-res-${Date.now()}.mp3`;

      await (FileSystem as any).writeAsStringAsync(fileUri, base64Audio, {
        encoding: "base64" as any,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      console.log("▶️ AI 답변 재생 시작");
      sound.setOnPlaybackStatusUpdate(async (ps) => {
        if (ps.isLoaded && ps.didJustFinish) {
          await sound.unloadAsync();
          console.log("AI 답변 재생 종료");
          isProcessingRef.current = false;
          startRecording();
        }
      });
      await sound.playAsync();
    } catch (e) {
      console.error("❌ 음성 재생 실패:", e);
      isProcessingRef.current = false;
      startRecording();
    }
  }

  async function cleanup() {
    if (meteringTimerRef.current) clearInterval(meteringTimerRef.current);
    if (recordingRef.current) try { await recordingRef.current.stopAndUnloadAsync(); } catch (e) {}
    if (socketRef.current) socketRef.current.close();
    isProcessingRef.current = true;
  }

  const current = statusText[status];
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.statusLeft}>
          <View style={styles.greenDot} /><Text style={styles.topText}>{current.top}</Text>
        </View>
        <Text style={styles.timer}>00:17</Text>
      </View>
      <View style={styles.centerArea}>
        <Animated.View style={[styles.avatarOuter, status !== "connecting" && { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.avatarInner}><Text style={styles.botEmoji}>🤖</Text></View>
        </Animated.View>
        <View style={styles.messageContainer}>
          <Text style={aiMessage ? styles.aiMessageText : styles.subtitle}>
            {aiMessage || "어르신의 말씀을 듣고 있어요..."}
          </Text>
        </View>
        <Text style={styles.title}>{current.main}</Text>
        <Text style={styles.subtitle}>{current.sub}</Text>
        <View style={styles.voiceBox}><Text style={styles.voiceDots}>{current.dots}</Text></View>
      </View>
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.speakerButton}><Text style={styles.speakerIcon}>🔊</Text></TouchableOpacity>
        <Text style={styles.speakerText}>스피커</Text>
        <TouchableOpacity style={styles.endButton} onPress={endCall}><Text style={styles.endIcon}>📞</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A" },
  topBar: { flexDirection: "row", justifyContent: "space-between", padding: 50, paddingTop: 60 },
  statusLeft: { flexDirection: "row", alignItems: "center" },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80", marginRight: 8 },
  topText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  timer: { color: "#FFF", fontSize: 16, opacity: 0.6 },
  centerArea: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 25 },
  avatarOuter: { width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(74, 222, 128, 0.1)", alignItems: "center", justifyContent: "center" },
  avatarInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#4ADE80", alignItems: "center", justifyContent: "center" },
  botEmoji: { fontSize: 40 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "700", marginTop: 20 },
  messageContainer: {
    marginTop: 30,
    minHeight: 160,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden'   
  },
  aiMessageText: { color: "#4ADE80", fontSize: 32, fontWeight: "800", textAlign: "center", lineHeight: 45 },
  subtitle: { color: "#FFF", fontSize: 18, opacity: 0.5, textAlign: "center", lineHeight: 26 },
  voiceBox: { marginTop: 30, height: 40, justifyContent: "center" },
  voiceDots: { color: "#4ADE80", fontSize: 24, letterSpacing: 4 },
  bottomArea: { paddingBottom: 60, alignItems: "center" },
  speakerButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  speakerIcon: { fontSize: 24 },
  speakerText: { color: "#FFF", opacity: 0.6, marginBottom: 40 },
  endButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FF4444", alignItems: "center", justifyContent: "center", transform: [{ rotate: "135deg" }] },
  endIcon: { fontSize: 32, color: "#FFF" },
});