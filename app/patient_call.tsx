import * as AudioStream from "@mykin-ai/expo-audio-stream";
import { decode as base64Decode, encode as base64Encode } from "base-64";
import { Audio } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  endSession,
  fetchPatientInfoForPatient,
  startSession,
} from "../services/api.js";

const ExpoPlayAudioStream = (AudioStream as any).ExpoPlayAudioStream;
const PlaybackModes = (AudioStream as any).PlaybackModes ?? {
  VOICE_PROCESSING: "voiceProcessing",
  REGULAR: "regular",
  CONVERSATION: "conversation",
};

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
  const params = useLocalSearchParams();
  const currentCallType = params.call_type || "voluntary";

  const [status, setStatus] = useState<CallStatus>("connecting");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string>("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const socketRef = useRef<WebSocket | null>(null);
  const isProcessingRef = useRef(false);

  const CHUNK_SIZE = 4096;

  const audioSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const soundChunkSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const pendingPcmRef = useRef<Uint8Array>(new Uint8Array());
  const isMicOnRef = useRef(false);
  const micOnPendingRef = useRef(false);
  const textQueueRef = useRef<string[]>([]);
  const sentenceEndRef = useRef(false); // SENTENCE_END 받았으면 다음 PCM 첫 청크 때 텍스트 교체

  useEffect(() => {
    const pulse = Animated.loop(
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
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    startCall();
    return () => {
      cleanup();
    };
  }, []);

  // --- API 및 통신 로직 ---

  async function startCall() {
    try {
      setStatus("connecting");
      console.log(
        `📱 [1단계: 통화 요청 시작] 백엔드로 세션 생성을 요청합니다... (타입: ${currentCallType})`,
      );

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
        Alert.alert(
          "인증 오류",
          "환자 정보를 불러올 수 없습니다. 다시 로그인해 주세요.",
        );
        router.back();
        return;
      }

      // 🌟 진짜 동적 ID를 실어서 통화 세션 요청을 발송합니다.
      const data = await startSession({
        call_type: currentCallType,
      });

      console.log(
        "📥 [2단계: API 응답 수신 성공] 서버 응답 상태 데이터::",
        data,
      );

      if (data) {
        // 🌟 백엔드가 세션 주머니 정보를 다채롭게 주더라도 낚아채도록 가드 구축
        const actualSessionId =
          data.session_id ||
          data.sessionId ||
          data.data?.session_id ||
          data.data?.sessionId;
        const actualWsUrl =
          data.websocket_url ||
          data.websocketUrl ||
          data.data?.websocket_url ||
          data.data?.websocketUrl;

        if (actualSessionId && actualWsUrl) {
          console.log("--------------------------------------------------");
          console.log(
            "✨ [3단계: 세션 데이터 매칭 완료] 통화 연결을 수립합니다.",
          );
          console.log(`   - 발급된 세션 ID : ${actualSessionId}`);
          console.log(`   - 웹소켓 연결 주소: ${actualWsUrl}`);
          console.log("--------------------------------------------------");

          setSessionId(actualSessionId);
          connectWebSocket(actualWsUrl);
        } else {
          console.log("⚠️ 필수 세션 정보 파싱 실패", {
            actualSessionId,
            actualWsUrl,
          });
          Alert.alert(
            "연결 실패",
            "통화 세션 필수 정보(ID/웹소켓 URL) 파싱에 실패했습니다.",
          );
          router.back();
        }
      } else {
        Alert.alert("연결 실패", "통화 세션 필수 정보를 받아오지 못했습니다.");
        router.back();
      }
    } catch (error) {
      console.error(
        "❌ [통화 에러] 1~3단계 통화 시작 단계 중 에러 발생:",
        error,
      );
      Alert.alert(
        "오류",
        "서버와 연결이 원활하지 않습니다. 다시 시도해 주세요.",
      );
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

      // 청크 재생 완료 구독 — 마지막 청크 재생 끝나면 마이크 켜기
      soundChunkSubscriptionRef.current =
        ExpoPlayAudioStream.subscribeToSoundChunkPlayed(async (event: any) => {
          if (event.isFinal && micOnPendingRef.current) {
            micOnPendingRef.current = false;
            console.log("🔊 마지막 청크 재생 완료 → 마이크 켜기");
            await startMicStreaming();
          }
        });

      startMicStreaming();
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        console.log("📥 [텍스트 수신]:", event.data);

        if (event.data === "MIC_OFF") {
          await stopMicStreaming();
          textQueueRef.current = [];
          sentenceEndRef.current = false;
          setStatus("speaking");
          return;
        }

        if (event.data === "MIC_ON") {
          micOnPendingRef.current = true;
          return;
        }

        if (event.data === "SENTENCE_END") {
          // 다음 PCM 첫 청크 올 때 텍스트 바꿀 준비만 함
          sentenceEndRef.current = true;
          console.log("📥 [SENTENCE_END] 다음 PCM 첫 청크 때 텍스트 교체 준비");
          return;
        }

        // 문장 텍스트 → 큐에 쌓기
        textQueueRef.current.push(event.data);
        console.log(
          "📥 [문장 큐에 추가]:",
          event.data,
          "/ 큐 길이:",
          textQueueRef.current.length,
        );
        return;
      }

      if (event.data instanceof ArrayBuffer) {
        const pcmChunk = new Uint8Array(event.data);

        if (sentenceEndRef.current || !aiMessage) {
          sentenceEndRef.current = false;

          const next = textQueueRef.current.shift();
          if (next) {
            setAiMessage(next);
            setStatus("speaking");
            console.log("📥 [오디오 시작과 함께 문장 표시]:", next);
          }
        }

        const base64Pcm = uint8ArrayToBase64(pcmChunk);
        await ExpoPlayAudioStream.playAudio(base64Pcm, "16000");

        console.log("📥 PCM chunk 수신 및 재생:", pcmChunk.length);
      }
    };
  }

  function base64ToUint8Array(base64: string) {
    const binary = base64Decode(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }

  function uint8ArrayToBase64(bytes: Uint8Array) {
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return base64Encode(binary);
  }

  function enqueueAndSendPcm(bytes: Uint8Array) {
    const previous = pendingPcmRef.current;
    const merged = new Uint8Array(previous.length + bytes.length);

    merged.set(previous, 0);
    merged.set(bytes, previous.length);

    let offset = 0;

    while (merged.length - offset >= CHUNK_SIZE) {
      const chunk = merged.slice(offset, offset + CHUNK_SIZE);

      if (
        socketRef.current?.readyState === WebSocket.OPEN &&
        isMicOnRef.current
      ) {
        socketRef.current.send(chunk);
      }

      offset += CHUNK_SIZE;
    }

    pendingPcmRef.current = merged.slice(offset);
  }

  async function startMicStreaming() {
    try {
      if (isMicOnRef.current) return;

      setStatus("listening");
      isMicOnRef.current = true;
      pendingPcmRef.current = new Uint8Array();

      await ExpoPlayAudioStream.setSoundConfig({
        sampleRate: 16000,
        playbackMode: PlaybackModes.VOICE_PROCESSING,
      });

      const { subscription } = await ExpoPlayAudioStream.startRecording({
        sampleRate: 16000,
        channels: 1,
        encoding: "pcm_16bit",
        interval: 100,
        onAudioStream: (event: any) => {
          if (!isMicOnRef.current) return;

          const pcmBytes = base64ToUint8Array(event.data);
          enqueueAndSendPcm(pcmBytes);
        },
      });

      audioSubscriptionRef.current = subscription;
      console.log("🎤 PCM 스트리밍 시작");
    } catch (error) {
      console.error("PCM 스트리밍 시작 실패:", error);
    }
  }

  async function stopMicStreaming() {
    try {
      if (!isMicOnRef.current) return;

      isMicOnRef.current = false;

      audioSubscriptionRef.current?.remove();
      audioSubscriptionRef.current = null;

      await ExpoPlayAudioStream.stopRecording();

      pendingPcmRef.current = new Uint8Array();

      console.log("🎤 PCM 스트리밍 중지");
    } catch (error) {
      console.error("PCM 스트리밍 중지 실패:", error);
    }
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

  async function cleanup() {
    await stopMicStreaming();

    soundChunkSubscriptionRef.current?.remove();
    soundChunkSubscriptionRef.current = null;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

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
        <View style={styles.messageContainer}>
          <Text style={aiMessage ? styles.aiMessageText : styles.subtitle}>
            {aiMessage || "어르신의 말씀을 듣고 있어요..."}
          </Text>
        </View>
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
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  avatarOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4ADE80",
    alignItems: "center",
    justifyContent: "center",
  },
  botEmoji: { fontSize: 40 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "700", marginTop: 20 },
  messageContainer: {
    marginTop: 30,
    minHeight: 160,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  aiMessageText: {
    color: "#4ADE80",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 45,
  },
  subtitle: {
    color: "#FFF",
    fontSize: 18,
    opacity: 0.5,
    textAlign: "center",
    lineHeight: 26,
  },
  voiceBox: { marginTop: 30, height: 40, justifyContent: "center" },
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
