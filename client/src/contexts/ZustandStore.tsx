import create from "zustand";

import {
  getKeyValuePairsByDoc,
  KeyValuesByDoc,
} from "../components/KeyValuePairs";

type State = {
  selectedFile: string;
  selectedChiclet: string;
  docData: KeyValuesByDoc[];
  konvaModalOpen: boolean;
  setSelectedFile: (selectedFile: string) => void;
  setSelectedChiclet: (selectedChiclet: string) => void;
  setDocData: (docData: KeyValuesByDoc[]) => void;
  setKonvaModalOpen: (konvaModalOpen: boolean) => void;
};

export const useStore = create<State>((set) => ({
  selectedFile: "",
  selectedChiclet: "",
  docData: getKeyValuePairsByDoc(),
  konvaModalOpen: false,
  setSelectedFile: (selectedFile) =>
    set((state) => ({ ...state, selectedFile })),
  setSelectedChiclet: (selectedChiclet) =>
    set((state) => ({ ...state, selectedChiclet })),
  setDocData: (docData) => set((state) => ({ ...state, docData })),
  setKonvaModalOpen: (konvaModalOpen) =>
    set((state) => ({ ...state, konvaModalOpen })),
}));
