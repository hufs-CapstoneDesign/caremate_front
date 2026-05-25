import { create } from "zustand";

// ==========================================
// 1. 타입 정의 (Types & Interfaces)
// ==========================================
type Relation = "자녀" | "배우자" | "손주/손녀" | "형제/자매" | "기타" | "";
type SeverityStage = "경증" | "중등도" | "중증" | "";

type Symptom =
  | "기억력 장애"
  | "지남력 장애"
  | "언어 장애"
  | "실행능력 장애"
  | "판단력 장애"
  | "망상"
  | "환각"
  | "오인"
  | "우울증"
  | "불안증세"
  | "초조행동"
  | "성격변화"
  | "수면의 변화"
  | "식욕의 변화"
  | "";

type Medication = "하루 1회" | "하루 2회" | "하루 3회" | "하루 4회 이상" | "기타" | "";

interface FamilyMember {
  name: string;
  relation: Relation;
}

interface Contact {
  name: string;
  role: string;
  nickname: string;
}

// ==========================================
// 2. 스토어 인터페이스 (Store Interface)
// ==========================================
interface AddPatientState {
  // --- 상태 (State) ---
  name: string;
  age: string;
  relation: Relation;
  severity: SeverityStage;
  symptoms: Symptom[];
  familyMembers: FamilyMember[];
  contacts: Contact[];
  medication: Medication;
  code: string; // 🌟 추가: 발급된 연결 코드 상태

  // --- 수정 함수 (Actions) ---
  setBasicInfo: (data: { name: string; age: string; relation: Relation }) => void;
  setSeverityInfo: (severity: SeverityStage) => void;
  setSymptomsInfo: (symptoms: Symptom[]) => void;
  setFamilyMembers: (members: FamilyMember[]) => void;
  setContacts: (contacts: Contact[]) => void;
  setMedication: (medication: Medication) => void;
  setCode: (code: string) => void; // 🌟 추가: 코드 저장을 위한 함수

  // --- 초기화 함수 ---
  reset: () => void;
}

// ==========================================
// 3. 스토어 생성 (Store Implementation)
// ==========================================
export const useAddPatientStore = create<AddPatientState>((set) => ({
  // --- 초기 데이터 상태 (Initial State) ---
  name: "",
  age: "",
  relation: "",
  severity: "",
  symptoms: [],
  familyMembers: [],
  contacts: [],
  medication: "",
  code: "", // 🌟 초기값 추가

  // --- 함수 구현 (Action Implementation) ---
  setBasicInfo: (data) =>
    set({
      name: data.name,
      age: data.age,
      relation: data.relation,
    }),

  setSeverityInfo: (severity) =>
    set({
      severity: severity,
    }),

  setSymptomsInfo: (symptoms) =>
    set({
      symptoms: symptoms,
    }),

  setFamilyMembers: (members) =>
    set({
      familyMembers: members,
    }),

  setContacts: (contacts) =>
    set({
      contacts: contacts,
    }),

  setMedication: (medication) =>
    set({
      medication: medication,
    }),

  // 🌟 추가: setCode 함수 구현
  setCode: (code) =>
    set({
      code: code,
    }),

  // 전체 데이터 리셋
  reset: () =>
    set({
      name: "",
      age: "",
      relation: "",
      severity: "",
      symptoms: [],
      familyMembers: [],
      contacts: [],
      medication: "",
      code: "", // 🌟 리셋 시 코드도 함께 비워지도록 수정
    }),
}));