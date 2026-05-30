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
import { loginGuardian } from "../services/api.js";

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
      // 1. API 호출 (이미 객체로 파싱된 데이터가 들어옵니다)
      const result = await loginGuardian({ username, password });
      
      console.log("로그인 API 응답:", result);

      // 2. 🌟 백엔드가 준 응답에 'access_token'이 존재하면 로그인 성공으로 판단합니다.
      if (result && result.access_token) {
        
        // 3. SecureStore에 신분과 토큰을 정확하게 저장합니다.
        await SecureStore.setItemAsync("userRole", "GUARDIAN");
        await SecureStore.setItemAsync("guardianToken", result.access_token);

        Alert.alert("성공", `${result.name || "보호자"}님, 환영합니다!`);
        
        // 4. 메인 화면으로 이동
        router.replace("/caregiver_main"); 
      } else {
        // 백엔드에서 200 OK는 왔지만 access_token이 없는 경우
        Alert.alert("실패", "로그인 정보가 올바르지 않습니다. 다시 확인해주세요.");
      }
    } catch (error) {
      console.error("로그인 에러 상세:", error);
      Alert.alert("오류", "서버 통신 중 에러가 발생했습니다.");
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
            <View style={styles.logoContainer}>
              <ShieldCheck size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>돌봄 파트너 로그인</Text>
            <Text style={styles.subtitle}>Caregiver Authentication</Text>
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