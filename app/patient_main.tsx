import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// 1. 라이브러리 임포트 (중괄호 없이 가져오는 것이 정석입니다)
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import LiveAudioStream from 'react-native-live-audio-stream';
import socket, { connectVoiceSocket } from '../constants/socket';
// 2. 인스턴스 생성 (export default 밖, 파일 상단에 위치)
const audioRecorderPlayer = new (AudioRecorderPlayer as any)();


export default function PatientMain() {
  // 3. 통화 시작 함수
  const handleStartConsultation = async () => {
    try {
      // 실시간 스트리밍 시작
      const response = await fetch("http://172.16.2.28:8000", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: "1", // 명세서의 string 타입
          call_type: "scheduled"   // 명세서의 string 타입
        }),
      });
      if (!response.ok) {
        throw new Error('통화 정보 전송 실패');
      }

      connectVoiceSocket();
            
      socket.emit('start_vito_session');
      LiveAudioStream.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        bufferSize: 4096,
      } as any);
      LiveAudioStream.on('data', (data) => {
        socket.emit('audio_chunk', data);
      });
      LiveAudioStream.start();

      // 로컬 녹음 시작
      await audioRecorderPlayer.startRecorder();

      // 전화 화면으로 이동
      router.push("/patient_call");
    } catch (error) {
      console.error("통화 시작 중 오류:", error);
    }
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
          onPress={handleStartConsultation}
        >
          <Ionicons name="call-outline" size={28} color="white" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.cardTitle}>AI에게 전화하기</Text>
            <Text style={styles.cardDesc}>언제든지 말을 걸어보세요</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 스타일 정의 (생략된 부분은 기존과 동일)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0FA67A" },
  header: { paddingTop: 80, paddingHorizontal: 20 },
  greeting: { color: "white", fontSize: 18 },
  name: { color: "white", fontSize: 26, fontWeight: "bold" },
  timeBox: { alignItems: "center", marginBottom: 40 },
  time: { color: "white", fontSize: 64, fontWeight: "bold" },
  date: { color: "white", marginTop: 10 },
  cardContainer: { flex: 1, backgroundColor: "#F2F2F2", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  cardPrimary: { flexDirection: "row", alignItems: "center", backgroundColor: "#12B886", padding: 20, borderRadius: 20 },
  cardTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  cardDesc: { color: "white", opacity: 0.8 },
  loginCard: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }
});