import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RNCallKeep from 'react-native-callkeep';

export default function IncomingCallScreen() {
    const router = useRouter();
    const uuid = 'fixed-uuid-for-demo';

  // 수락: 통화 화면으로 이동 (replace를 써서 뒤로가기 방지)
    const handleAccept = () => {
        RNCallKeep.answerIncomingCall(uuid);
        router.replace('/patient_call');
    };

  // 거절: 이전 화면으로 돌아가거나 앱 닫기
  const handleReject = () => {
    RNCallKeep.endCall(uuid);
    if (router.canGoBack()) {
      router.back();
    } else {
      // 앱이 첫 화면으로 켜졌을 경우의 처리
      router.replace('/'); 
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