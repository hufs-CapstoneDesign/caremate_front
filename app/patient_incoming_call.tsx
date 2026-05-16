import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🛠️ 중요: RNCallKeep 로드 시 에러가 나거나 존재하지 않을 경우를 대비한 안전장치
let RNCallKeep: any = null;
try {
  RNCallKeep = require('react-native-callkeep').default;
} catch (e) {
  console.warn("RNCallKeep를 로드할 수 없습니다. Expo Go 환경이거나 빌드 설정이 누락되었을 수 있습니다.");
}

export default function IncomingCallScreen() {
  const router = useRouter();
  const uuid = 'fixed-uuid-for-demo';

  // 수락: 통화 화면으로 이동
  const handleAccept = () => {
    // CallKeep 모듈이 정상적으로 로드되었을 때만 실행
    if (RNCallKeep && typeof RNCallKeep.answerIncomingCall === 'function') {
      try {
        RNCallKeep.answerIncomingCall(uuid);
      } catch (e) {
        console.error("CallKeep answer error:", e);
      }
    } else {
      console.log("시뮬레이터/Expo Go 환경이므로 CallKeep 로직을 스킵하고 화면만 이동합니다.");
    }
    
    // 이제 컴파일 에러가 나지 않으므로 정상적으로 이동합니다.
    router.replace('/patient_call'); 
  };

  // 거절: 이전 화면으로 돌아가거나 메인으로 이동
  const handleReject = () => {
    if (RNCallKeep && typeof RNCallKeep.endCall === 'function') {
      try {
        RNCallKeep.endCall(uuid);
      } catch (e) {
        console.error("CallKeep end error:", e);
      }
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/patient_main'); 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.status}>통화 수신 중...</Text>
        <Text style={styles.name}>AI 케어봇</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.circle, styles.decline]} 
          onPress={handleReject}
        >
          <Text style={styles.btnText}>거절</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.circle, styles.accept]} 
          onPress={handleAccept}
        >
          <Text style={styles.btnText}>수락</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'space-around', alignItems: 'center' },
  header: { alignItems: 'center' },
  status: { color: '#aaa', fontSize: 18, marginBottom: 8 },
  name: { color: '#fff', fontSize: 36, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-evenly' },
  circle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  decline: { backgroundColor: '#FF3B30' },
  accept: { backgroundColor: '#34C759' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});