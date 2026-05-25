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
} from "react-native";

export default function PatientConnectCodeScreen() {
  const [code, setCode] = useState("");

  const handleSubmit = () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      Alert.alert("안내", "연결 코드를 입력해 주세요.");
      return;
    }

    console.log("입력한 연결 코드:", trimmedCode);

    // TODO: API 연결 예정
    // 성공 시:
    // router.replace("/patient_main");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
          placeholder="예: CARE-0829"
          placeholderTextColor="#A0AEC0"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={[styles.submitButton, !code.trim() && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={!code.trim()}
        >
          <Text style={styles.submitText}>연결하기</Text>
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