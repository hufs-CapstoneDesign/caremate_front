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

interface OtherPeople {
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
  otherPeople: OtherPeople[];
  medication: Medication;

  // --- 수정 함수 (Actions) ---
  setBasicInfo: (data: { name: string; age: string; relation: Relation }) => void;
  setSeverityInfo: (severity: SeverityStage) => void;
  setSymptomsInfo: (symptoms: Symptom[]) => void;
  setFamilyMembers: (members: FamilyMember[]) => void;
  setOtherPeople: (people: OtherPeople[]) => void;
  setMedication: (medication: Medication) => void;

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
  otherPeople: [],
  medication: "",

  // --- 함수 구현 (Action Implementation) ---
  // 1단계: 기초 정보 저장
  setBasicInfo: (data) =>
    set({
      name: data.name,
      age: data.age,
      relation: data.relation,
    }),

  // 2단계: 중증도 저장
  setSeverityInfo: (severity) =>
    set({
      severity: severity,
    }),

  // 3단계: 증상 복수 선택 저장
  setSymptomsInfo: (symptoms) =>
    set({
      symptoms: symptoms,
    }),

  // 4단계: 가족 구성원 리스트 저장
  setFamilyMembers: (members) =>
    set({
      familyMembers: members,
    }),

  // 5단계: 자주 만나는 주변인 리스트 저장
  setOtherPeople: (people) =>
    set({
      otherPeople: people,
    }),

  // 6단계: 복약 정보 저장
  setMedication: (medication) =>
    set({
      medication: medication,
    }),

  // 전체 데이터 리셋 (등록 취소 혹은 최종 등록 완료 후 호출)
  reset: () =>
    set({
      name: "",
      age: "",
      relation: "",
      severity: "",
      symptoms: [],
      familyMembers: [],
      otherPeople: [],
      medication: "",
    }),
}));