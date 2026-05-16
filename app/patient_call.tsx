import { encode as base64Encode } from "base-64";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = "http://서버주소"; // 예: http://192.168.0.12:8000
const PATIENT_ID = "patient-001";
const CALL_TYPE = "AI_CARE";

type CallStatus = "connecting" | "listening" | "speaking";

const SILENCE_LIMIT_MS = 2000;
const METERING_INTERVAL_MS = 250;
const SILENCE_THRESHOLD = -45; // 숫자가 작을수록 더 작은 소리. 환경에 따라 조절

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
  const [status, setStatus] = useState<CallStatus>("connecting");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const meteringTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastVoiceTimeRef = useRef<number>(Date.now());
  const isProcessingRef = useRef(false);

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

  useEffect(() => {
    startCall();

    return () => {
      cleanup();
    };
  }, []);

  async function startCall() {
    try {
      setStatus("connecting");

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        console.log("마이크 권한이 거부되었습니다.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: PATIENT_ID,
          call_type: CALL_TYPE,
        }),
      });

      if (!response.ok) {
        throw new Error("통화 시작 API 실패");
      }

      const data = await response.json();

      const newSessionId = data.session_id;
      const websocketUrl = data.websocket_url;

      setSessionId(newSessionId);
      connectWebSocket(websocketUrl);
    } catch (error) {
      console.error("통화 시작 실패:", error);
    }
  }

  function connectWebSocket(websocketUrl: string) {
    const ws = new WebSocket(websocketUrl);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("웹소켓 연결 완료");
      socketRef.current = ws;
      startRecording();
    };

    ws.onmessage = async (event) => {
      console.log("서버 응답 수신");

      if (event.data instanceof ArrayBuffer) {
        await playBinaryAudio(event.data);
      } else if (typeof event.data === "string") {
        console.log("문자열 메시지 수신:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("웹소켓 오류:", error);
    };

    ws.onclose = () => {
      console.log("웹소켓 종료");
    };
  }

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

      console.log("녹음 시작");
    } catch (error) {
      console.error("녹음 시작 실패:", error);
    }
  }

  function startSilenceDetection() {
    if (meteringTimerRef.current) {
      clearInterval(meteringTimerRef.current);
    }

    meteringTimerRef.current = setInterval(async () => {
      const recording = recordingRef.current;
      if (!recording || isProcessingRef.current) return;

      try {
        const recordingStatus = await recording.getStatusAsync();

        if (!recordingStatus.isRecording) return;

        const metering = recordingStatus.metering;

        if (typeof metering === "number") {
          if (metering > SILENCE_THRESHOLD) {
            lastVoiceTimeRef.current = Date.now();
          }

          const silenceDuration = Date.now() - lastVoiceTimeRef.current;

          if (silenceDuration >= SILENCE_LIMIT_MS) {
            console.log("2초 침묵 감지 → 발화 종료");
            await stopRecordingAndSend();
          }
        }
      } catch (error) {
        console.error("침묵 감지 실패:", error);
      }
    }, METERING_INTERVAL_MS);
  }

  async function stopRecordingAndSend() {
    if (!recordingRef.current) return;

    try {
      isProcessingRef.current = true;

      if (meteringTimerRef.current) {
        clearInterval(meteringTimerRef.current);
        meteringTimerRef.current = null;
      }

      const recording = recordingRef.current;
      recordingRef.current = null;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      console.log("녹음 종료:", uri);

      if (uri) {
        await sendRecordingToServer(uri);
      }
    } catch (error) {
      console.error("녹음 종료/전송 실패:", error);
      isProcessingRef.current = false;
      startRecording();
    }
  }

  async function sendRecordingToServer(uri: string) {
    try {
      const ws = socketRef.current;

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.log("웹소켓이 열려 있지 않습니다.");
        isProcessingRef.current = false;
        return;
      }

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      ws.send(
        JSON.stringify({
          type: "user_audio",
          session_id: sessionId,
          audio_base64: base64Audio,
        }),
      );

      console.log("녹음 파일 웹소켓 전송 완료");
    } catch (error) {
      console.error("녹음 파일 전송 실패:", error);
      isProcessingRef.current = false;
      startRecording();
    }
  }

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return base64Encode(binary);
  }

  async function playBinaryAudio(arrayBuffer: ArrayBuffer) {
    try {
      setStatus("speaking");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      const base64Audio = arrayBufferToBase64(arrayBuffer);

      const fileUri = `${FileSystem.cacheDirectory}ai-response-${Date.now()}.mp3`;

      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });

      sound.setOnPlaybackStatusUpdate(async (playbackStatus) => {
        if (!playbackStatus.isLoaded) return;

        if (playbackStatus.didJustFinish) {
          await sound.unloadAsync();
          console.log("AI 음성 재생 완료");

          isProcessingRef.current = false;
          startRecording();
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error("AI 음성 재생 실패:", error);
      isProcessingRef.current = false;
      startRecording();
    }
  }

  async function endCall() {
    try {
      console.log("통화 종료 시작");

      await cleanup();

      if (sessionId) {
        const response = await fetch(`${API_BASE_URL}/calls/${sessionId}`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("통화 종료 API 실패");
        }
      }

      router.push("/patient_main");
    } catch (error) {
      console.error("통화 종료 실패:", error);
      router.push("/patient_main");
    }
  }

  async function cleanup() {
    // 1. 침묵 감지 타이머 종료
    if (meteringTimerRef.current) {
      clearInterval(meteringTimerRef.current);
      meteringTimerRef.current = null;
    }

    // 2. 녹음 중이면 녹음 종료
    if (recordingRef.current) {
      try {
        const recording = recordingRef.current;
        recordingRef.current = null;

        await recording.stopAndUnloadAsync();
        console.log("통화 종료로 녹음 중지 완료");
      } catch (error) {
        console.log("녹음 종료 중 오류:", error);
      }
    }

    // 3. 웹소켓 종료
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      console.log("웹소켓 종료 완료");
    }

    // 4. 상태 초기화
    isProcessingRef.current = true;
  }

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

        <TouchableOpacity style={styles.endButton} onPress={endCall}>
          <Text style={styles.endIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 50,
    paddingTop: 60,
  },
  statusLeft: { flexDirection: "row", alignItems: "center" },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 8,
  },
  topText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  timer: { color: "#FFF", fontSize: 16, opacity: 0.6 },
  centerArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4ADE80",
    alignItems: "center",
    justifyContent: "center",
  },
  botEmoji: { fontSize: 50 },
  title: { color: "#FFF", fontSize: 28, fontWeight: "700", marginTop: 24 },
  subtitle: { color: "#FFF", fontSize: 18, opacity: 0.7, marginTop: 8 },
  voiceBox: { marginTop: 40, height: 40, justifyContent: "center" },
  voiceDots: { color: "#4ADE80", fontSize: 24, letterSpacing: 4 },
  bottomArea: { paddingBottom: 60, alignItems: "center" },
  speakerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  speakerIcon: { fontSize: 24 },
  speakerText: { color: "#FFF", opacity: 0.6, marginBottom: 40 },
  endButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FF4444",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "135deg" }],
  },
  endIcon: { fontSize: 32, color: "#FFF" },
});
