import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  useEffect(() => {
    // 1. CallKeep 설정
    const options: any = {
      ios: { appName: 'Caremate' },
      android: {
        alertTitle: '권한 필요',
        alertDescription: '환자 호출 알림을 위해 전화 권한이 필요합니다.',
        cancelButton: '취소',
        okButton: '확인',
        selfManaged: true,
      },
    };

    try {
      RNCallKeep.setup(options);
      RNCallKeep.setAvailable(true);
    } catch (err) {
      console.error('CallKeep setup error:', err);
    }

    // 2. 전화 수락 이벤트 리스너
    const onAnswerCall = ({ callUUID }: { callUUID: string }) => {
      // --- 여기서 Platform을 사용합니다 (이제 안 지워질 거예요!) ---
      if (Platform.OS === 'android') {
        RNCallKeep.backToForeground();
      }
      
      router.push("/patient_call");
    };

    // 3. 이벤트 등록
    RNCallKeep.addEventListener('answerCall', onAnswerCall);

    return () => {
      RNCallKeep.removeEventListener('answerCall');
    };
  }, [router]); // router를 의존성 배열에 추가

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 인덱스 화면 */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* 전화 수신 팝업 화면 (우리가 만든 화면) */}
        <Stack.Screen 
          name="patient_incoming_call" 
          options={{ 
            presentation: 'fullScreenModal', // 전체 화면으로 띄움
            animation: 'fade' 
          }} 
        />
        
        {/* 실제 통화 화면 */}
        <Stack.Screen name="patient_call" options={{ title: '통화 중' }} />
        
        {/* 기존 화면들 */}
        <Stack.Screen name="patient_main" />
        <Stack.Screen name="explore" />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}