import { router } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ShieldCheck, Lock, Mail } from 'lucide-react-native';
import * as SecureStore from "expo-secure-store";

export default function CaregiverLoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 보호자 로그인 처리 함수
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("알림", "사용자 이름과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("백엔드 응답 전체 데이터:", result);

        const tokenToSave = result.access_token || result.accessToken || result.token;

        if (tokenToSave) {
          await SecureStore.setItemAsync("userToken", String(tokenToSave));
          await SecureStore.setItemAsync("userRole", "CAREGIVER"); // 👈 이거 추가

          Alert.alert("성공", "로그인되었습니다.");
          router.replace("/caregiver_main"); // 메인 화면으로 이동
        } else {
          Alert.alert("로그인 실패", "서버로부터 인증 토큰을 받지 못했습니다. 변수명을 확인해주세요.");
          console.error("토큰을 찾을 수 없습니다. result 객체 구조:", result);
        }
      } else {
        Alert.alert("로그인 실패", result.message || "정보를 다시 확인해 주세요.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("에러", "네트워크 리퀘스트 타임아웃 또는 서버 연결 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // UI 렌더링 영역 (정확히 함수 내부에 위치)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.innerContainer}
        >
          {/* 상단 타이틀 */}
          <View style={styles.headerSection}>
              {/* 🌟 [수정] 방패 아이콘을 터치 가능한 버튼으로 변경하여 index 화면("/")으로 이동하게 함 */}
              <TouchableOpacity 
                style={styles.logoContainer}
                onPress={() => router.replace("/")}
                activeOpacity={0.7}
              >
                <ShieldCheck size={40} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.title}>돌봄파트너 로그인</Text>
              <Text style={styles.subtitle}>보호자 계정으로 서비스를 시작합니다</Text>
            </View>

          {/* 입력 폼 */}
          <View style={styles.formSection}>
            {/* 사용자 이름(Username) 입력란 */}
            <View style={styles.inputContainer}>
              <View style={styles.iconWrapper}>
                <Mail size={22} color="#A0A5B5" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="사용자 이름을 입력하세요"
                placeholderTextColor="#A0A5B5"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 비밀번호 입력란 */}
            <View style={styles.inputContainer}>
              <View style={styles.iconWrapper}>
                <Lock size={22} color="#A0A5B5" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#A0A5B5"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 버튼 섹션 */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>로그인하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
} // 👈 컴포넌트 함수가 여기서 완벽하게 닫힙니다.

// 스타일시트 정의 (단 한 번만 깔끔하게 선언)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1C1E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A90E2",
    marginBottom: 20,
  },
  formSection: {
    gap: 16,
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 60,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  iconWrapper: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A1C1E",
    fontWeight: "500",
    height: "100%",
  },
  buttonSection: {
    gap: 14,
  },
  loginButton: {
    backgroundColor: "#1A1C1E",
    borderRadius: 20,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1A1C1E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});