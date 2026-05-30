import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { loginPatient} from "../services/api.js";

export default function PatientConnectCodeScreen() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      Alert.alert("안내", "연결 코드를 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginPatient(trimmedCode);

      if (data && !data.detail && !data.message) {
        const { access_token, user_id, role, name } = data;

        // 🌟 [로그 출력 시작] 백엔드에서 받은 응답 데이터를 터미널에 예쁘게 찍어줍니다.
        console.log("==========================================");
        console.log("📥 [백엔드 응답] 로그인 성공 데이터 수신");
        console.log("------------------------------------------");
        console.log(`👤 이름(name)     : ${name}`);
        console.log(`🔑 유저ID(user_id) : ${user_id}`);
        console.log(`🎖️ 역할(role)     : ${role}`);
        console.log(`🎫 토큰 타입      : ${data.token_type}`);
        console.log(`🔒 JWT 토큰       : ${access_token ? `${access_token.substring(0, 15)}...[생략]...` : "없음"}`);
        console.log("==========================================");

        if (access_token) {
          // 암호화된 보안 저장소(SecureStore)에 각각의 정보 저장
          await SecureStore.setItemAsync("ACCESS_TOKEN", data.access_token);
          await SecureStore.setItemAsync("PATIENT_ID", data.user_id); // 본인이 곧 환자
          await SecureStore.setItemAsync("PATIENT_NAME", data.name);

          console.log("💾 스마트폰 SecureStore에 모든 데이터 저장 완료.");

          // 성공 시 메인 화면으로 이동
          router.replace("/patient_main");
        } else {
          Alert.alert("오류", "서버 응답 형식이 올바르지 않습니다. (토큰 누락)");
        }
      } else {
        const errorMessage = data.detail || data?.message || "연결에 실패했습니다. 코드를 다시 확인해 주세요.";
        Alert.alert("인증 실패", errorMessage);
      }
    } catch (error) {
      console.error("🚨 환자 로그인 API 요청 중 에러 발생:", error);
      Alert.alert("네트워크 오류", "서버와 통신할 수 없습니다. 네트워크 상태를 확인해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          disabled={isLoading}
        >
          <Ionicons name="chevron-back" size={26} color="#1A1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>보호자 연결</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="link-outline" size={42} color="#4A90E2" />
        </View>

        <Text style={styles.title}>연결 코드를{"\n"}입력해 주세요</Text>

        <Text style={styles.description}>
          보호자 계정에서 발급받은{"\n"}
          연결 코드를 입력해 주세요.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="연결 코드 입력"
          placeholderTextColor="#A0AEC0"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[
            styles.submitButton, 
            (!code.trim() || isLoading) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!code.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>연결하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1C1E",
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#EEF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 34,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1A1C1E",
    textAlign: "center",
    lineHeight: 44,
  },
  description: {
    marginTop: 18,
    fontSize: 17,
    color: "#718096",
    textAlign: "center",
    lineHeight: 27,
    marginBottom: 44,
  },
  input: {
    width: "100%",
    height: 72,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1C1E",
    textAlign: "center",
    letterSpacing: 2,
    borderWidth: 2,
    borderColor: "#EEF0F4",
  },
  submitButton: {
    width: "100%",
    height: 72,
    borderRadius: 24,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 26,
  },
  disabledButton: {
    backgroundColor: "#CBD5E1",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
});