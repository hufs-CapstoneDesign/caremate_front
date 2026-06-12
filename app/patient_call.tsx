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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const socketRef = useRef<WebSocket | null>(null);
  const isProcessingRef = useRef(false);
  const callStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const CHUNK_SIZE = 4096;

  const audioSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const soundChunkSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const pendingPcmRef = useRef<Uint8Array>(new Uint8Array());
  const isMicOnRef = useRef(false);
  const micOnPendingRef = useRef(false);
  const textQueueRef = useRef<string[]>([]);
  const sentenceEndRef = useRef(false);

  // ─── 애니메이션 ───────────────────────────────────────────────────────────
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

  // ─── 통화 시작 / 종료 ─────────────────────────────────────────────────────
  useEffect(() => {
    startCall();
    return () => {
      cleanup();
    };
  }, []);

  // ─── 타이머 ───────────────────────────────────────────────────────────────
  function formatElapsed(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function startTimer() {
    if (timerIntervalRef.current) return;
    callStartTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - (callStartTimeRef.current ?? Date.now())) / 1000,
      );
      setElapsedSeconds(elapsed);
    }, 1000);
  }

  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  // ─── API 및 통신 로직 ─────────────────────────────────────────────────────
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

      const me = await fetchPatientInfoForPatient();
      const realPatientId = me?.user_id ?? null;
      console.log("🔑 API에서 로드한 실제 환자 ID:", realPatientId);

      if (!realPatientId) {
        Alert.alert(
          "인증 오류",
          "환자 정보를 불러올 수 없습니다. 다시 로그인해 주세요.",
        );
        router.replace('./index');
        return;
      }

      const data = await startSession({ call_type: currentCallType });

      console.log(
        "📥 [2단계: API 응답 수신 성공] 서버 응답 상태 데이터::",
        data,
      );

      if (data) {
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
          router.replace('/patient_main');
        }
      } else {
        Alert.alert("연결 실패", "통화 세션 필수 정보를 받아오지 못했습니다.");
        router.replace('/patient_main');
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
      router.replace('/patient_main');
    }
  }

  function connectWebSocket(websocketUrl: string) {
    console.log("4. [WS 연결 시도]:", websocketUrl);
    const ws = new WebSocket(websocketUrl);
    ws.binaryType = "arraybuffer";

    // AI 발화가 끝났고 마이크를 켤 준비가 되었는지 판단하는 임시 상태 변수 (함수 내 스코프)
    let isAiFinishedTalking = false;

    ws.onopen = async () => {
      socketRef.current = ws;

      // ✅ [에코 수정] setSoundConfig는 세션당 딱 한 번만 호출합니다.
      // 매 턴마다 재호출하면 AEC(에코 캔슬러)가 리셋되어 통화 후반부에 에코가 발생합니다.
      await ExpoPlayAudioStream.setSoundConfig({
        sampleRate: 16000,
        playbackMode: PlaybackModes.VOICE_PROCESSING,
      });
      console.log("🔧 오디오 세션 설정 완료 (VOICE_PROCESSING, 1회 적용)");

      // 오디오 청크 재생 완료 이벤트 구독
      soundChunkSubscriptionRef.current =
        ExpoPlayAudioStream.subscribeToSoundChunkPlayed(async (event: any) => {
          // 재생이 진짜 끝났을(isFinal) 때, 서버에서도 MIC_ON 신호가 이미 와 있었다면 마이크를 켭니다.
          if (event.isFinal) {
            console.log("🔊 AI 오디오 청크 최종 재생 완료");
            if (micOnPendingRef.current) {
              micOnPendingRef.current = false;
              console.log("🎤 조건 충족: 서버 신호 확인됨 -> 마이크 스트리밍 시작");
              await startMicStreaming();
            } else {
              // 오디오는 끝났는데 아직 서버에서 MIC_ON을 안 준 경우, 플래그만 세팅하고 대기
              isAiFinishedTalking = true;
            }
          }
        });

      if (currentCallType === "scheduled") {
        console.log("📅 스케줄 콜 - AI 먼저 발화 대기 중");
        setStatus("speaking");
        startTimer();
      } else {
        startMicStreaming();
      }
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
          console.log("📥 [MIC_ON 신호 수신] -> 마이크 대기 상태 전환");
          micOnPendingRef.current = true;

          // 서버에서 MIC_ON이 왔을 때, 이미 AI 오디오 재생이 끝나 있는 상태라면 즉시 마이크를 켭니다.
          if (isAiFinishedTalking) {
            console.log("🎤 조건 충족: AI 발화가 이미 끝남 -> 즉시 마이크 스트리밍 시작");
            micOnPendingRef.current = false;
            isAiFinishedTalking = false;
            await startMicStreaming();
          }
          return;
        }

        if (event.data === "SENTENCE_END") {
          sentenceEndRef.current = true;
          console.log("📥 [SENTENCE_END] 다음 PCM 첫 청크 때 텍스트 교체 준비");
          return;
        }

        textQueueRef.current.push(event.data);
        return;
      }

      if (event.data instanceof ArrayBuffer) {
        // 새로운 오디오가 들어오기 시작하면, AI가 아직 말하는 중이므로 발화 완료 플래그를 꺼둡니다.
        isAiFinishedTalking = false;

        const pcmChunk = new Uint8Array(event.data);

        if (sentenceEndRef.current || !aiMessage) {
          sentenceEndRef.current = false;
          const next = textQueueRef.current.shift();
          if (next) {
            setAiMessage(next);
            setStatus("speaking");
          }
        }

        const base64Pcm = uint8ArrayToBase64(pcmChunk);
        await ExpoPlayAudioStream.playAudio(base64Pcm, "16000");
      }
    };

    ws.onerror = (error) => { console.error("❌ [WS 에러]:", error); };
    ws.onclose = (event) => { console.warn(`⚠️ [WS 연결 종료] code=${event.code}`); };
  }

  // ─── 유틸 ─────────────────────────────────────────────────────────────────
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

  // ─── 마이크 스트리밍 ──────────────────────────────────────────────────────
  async function startMicStreaming() {
    try {
      if (isMicOnRef.current) return;

      setStatus("listening");
      isMicOnRef.current = true;
      pendingPcmRef.current = new Uint8Array();

      // ✅ [에코 수정] setSoundConfig 호출 제거.
      // ws.onopen에서 세션 최초 1회만 설정하므로 여기서 재호출하지 않습니다.

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
      startTimer();
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
      router.replace('/patient_main');
    } catch (error) {
      console.error("❌ 통화 종료 실패:", error);
      router.replace('/patient_main');
    }
  }

  async function cleanup() {
    await stopMicStreaming();
    stopTimer();

    soundChunkSubscriptionRef.current?.remove();
    soundChunkSubscriptionRef.current = null;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    isProcessingRef.current = true;
  }

  // ─── 렌더 ─────────────────────────────────────────────────────────────────
  const current = statusText[status];
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.statusLeft}>
          <View style={styles.greenDot} />
          <Text style={styles.topText}>{current.top}</Text>
        </View>
        <Text style={styles.timer}>{formatElapsed(elapsedSeconds)}</Text>
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
            {aiMessage || (currentCallType === "scheduled"
              ? "AI 케어봇이 전화를 연결하고 있어요..."
              : "어르신의 말씀을 듣고 있어요...")}
          </Text>
        </View>
        <Text style={styles.title}>{current.main}</Text>
        <Text style={styles.subtitle}>{current.sub}</Text>
        <View style={styles.voiceBox}>
          <Text style={styles.voiceDots}>{current.dots}</Text>
        </View>
      </View>
      <View style={styles.bottomArea}>
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
