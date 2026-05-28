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
// 🌟 lucide-react-native 아이콘 임포트 확인
import { ShieldCheck, Lock, Mail } from 'lucide-react-native';
// 안전한 토큰 저장을 위한 SecureStore 임포트
import * as SecureStore from "expo-secure-store";

export default function CaregiverLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 보호자 로그인 처리 함수
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("알림", "이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 백엔드 로그인 API 호출 (환경 변수 또는 실제 URL 확인)
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/caregiver/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        // 금고(SecureStore)에 역할과 보호자 토큰 저장
        await SecureStore.setItemAsync("userRole", "GUARDIAN");
        await SecureStore.setItemAsync("guardianToken", result.token);

        // 보호자 메인 화면으로 전송
        router.replace("/caregiver_main");
      } else {
        Alert.alert("로그인 실패", result.message || "이메일 또는 비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("보호자 로그인 중 에러 발생:", error);
      Alert.alert("오류", "서버와의 연결이 원활하지 않습니다. 네트워크를 확인해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            
            {/* 상단 로고 섹션 */}
            <View style={styles.logoSection}>
              <View style={styles.logoBox}>
                <ShieldCheck size={50} color="#4A90E2" fill="#4A90E2" fillOpacity={0.2} />
              </View>
              <Text style={styles.title}>보호자 로그인</Text>
              <Text style={styles.subtitle}>어르신의 안전한 일상을 관리합니다</Text>
            </View>

            {/* 입력 폼 섹션 */}
            <View style={styles.formSection}>
              
              {/* 이메일 입력창 */}
              <View style={styles.inputContainer}>
                {/* 🌟 빨간 줄 방지: 아이콘 컴포넌트 자체에 스타일 프롭스를 안전하게 전달 */}
                <View style={styles.iconWrapper}>
                  <Mail size={20} color="#8E9AA7" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="이메일 주소 입력"
                  placeholderTextColor="#CDD4DB"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* 비밀번호 입력창 */}
              <View style={styles.inputContainer}>
                {/* 🌟 빨간 줄 방지: 아이콘 컴포넌트 자체에 스타일 프롭스를 안전하게 전달 */}
                <View style={styles.iconWrapper}>
                  <Lock size={20} color="#8E9AA7" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 입력"
                  placeholderTextColor="#CDD4DB"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              
            </View>

            {/* 하단 버튼 섹션 */}
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

              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>이전 화면으로</Text>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 40,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
    height: "100%", // 입력 영역 확보
  },
  buttonSection: {
    gap: 14,
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 24,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#A5C8F3",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  backButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#8E9AA7",
    fontSize: 15,
    fontWeight: "600",
  },
});