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
      // 1. 우리가 고친 api.js의 loginPatient 호출
      const result = await loginPatient(trimmedCode);

      console.log("🚀 백엔드 응답 원본 확인:", result);
      
      if (result) {
        // 🌟 [교정] 백엔드 실제 명세(user_id, name, access_token)에 정확히 맞추어 맵핑합니다.
        const actualId = result.user_id || result.id || result.data?.user_id;
        const actualName = result.name || result.patientName || "어르신";
        const actualToken = result.access_token || result.token || result.data?.access_token;
        
        const idToSave = actualId ? String(actualId) : String(trimmedCode);

        // 💾 환자 메인 화면과 api.js 공통 함수가 읽어갈 Key 이름 매칭 완료
        await SecureStore.setItemAsync("userRole", "patient");
        await SecureStore.setItemAsync("patientToken", String(actualToken));

        console.log("💾 SecureStore 저장 완료 데이터:", { idToSave, actualName, tokenCheck: String(actualToken).substring(0, 10) });

        Alert.alert("성공", "환자 연동이 완료되었습니다.");
        router.replace("/patient_main"); // 메인 화면으로 이동
      } else {
        Alert.alert("연동 실패", "올바르지 않거나 만료된 코드입니다.");
      }
    } catch (error) {
      console.error("환자 코드 로그인 에러:", error);
      Alert.alert("에러", "서버 연결에 실패했습니다.");
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
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  header: { height: 64, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1A1C1E" },
  headerSpacer: { width: 44 },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: "center", alignItems: "center" },
  iconCircle: { width: 104, height: 104, borderRadius: 52, backgroundColor: "#EEF5FF", justifyContent: "center", alignItems: "center", marginBottom: 34 },
  title: { fontSize: 34, fontWeight: "800", color: "#1A1C1E", textAlign: "center", lineHeight: 44 },
  description: { marginTop: 18, fontSize: 17, color: "#718096", textAlign: "center", lineHeight: 27, marginBottom: 44 },
  input: { width: "100%", height: 72, borderRadius: 24, backgroundColor: "#FFFFFF", paddingHorizontal: 24, fontSize: 22, fontWeight: "800", color: "#1A1C1E", textAlign: "center", letterSpacing: 2, borderWidth: 2, borderColor: "#EEF0F4" },
  submitButton: { width: "100%", height: 72, borderRadius: 24, backgroundColor: "#4A90E2", justifyContent: "center", alignItems: "center", marginTop: 26 },
  disabledButton: { backgroundColor: "#CBD5E1" },
  submitText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
});