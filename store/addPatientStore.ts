import { create } from "zustand";

type Relation = "자녀" | "배우자" | "손주/손녀" | "형제/자매" | "기타" | "";

interface AddPatientState {
  name: string;
  age: string;
  relation: Relation;

  setBasicInfo: (data: {
    name: string;
    age: string;
    relation: Relation;
  }) => void;

  reset: () => void;
}

export const useAddPatientStore = create<AddPatientState>((set) => ({
  name: "",
  age: "",
  relation: "",

  setBasicInfo: (data) =>
    set({
      name: data.name,
      age: data.age,
      relation: data.relation,
    }),

  reset: () =>
    set({
      name: "",
      age: "",
      relation: "",
    }),
}));