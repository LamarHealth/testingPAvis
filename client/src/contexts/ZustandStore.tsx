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
  autocompleteAnchor: null | HTMLInputElement;
  eventTarget: null | HTMLInputElement;
  targetString: string;
  kvpTableAnchorEl: null | HTMLInputElement;
  setSelectedFile: (selectedFile: string) => void;
  setSelectedChiclet: (selectedChiclet: string) => void;
  setDocData: (docData: KeyValuesByDoc[]) => void;
  setKonvaModalOpen: (konvaModalOpen: boolean) => void;
  setAutocompleteAnchor: (
    autocompleteAnchorEl: null | HTMLInputElement
  ) => void;
  setEventTarget: (eventTarget: HTMLInputElement) => void;
  setTargetString: (targetString: string) => void;
  setKvpTableAnchorEl: (kvpTableAnchorEl: null | HTMLInputElement) => void;
};

export const useStore = create<State>((set) => ({
  selectedFile: "",
  selectedChiclet: "",
  docData: getKeyValuePairsByDoc(),
  konvaModalOpen: false,
  autocompleteAnchor: null,
  eventTarget: null,
  targetString: "",
  kvpTableAnchorEl: null,
  setSelectedFile: (selectedFile) =>
    set((state) => ({ ...state, selectedFile })),
  setSelectedChiclet: (selectedChiclet) =>
    set((state) => ({ ...state, selectedChiclet })),
  setDocData: (docData) => set((state) => ({ ...state, docData })),
  setKonvaModalOpen: (konvaModalOpen) =>
    set((state) => ({ ...state, konvaModalOpen })),
  setAutocompleteAnchor: (autocompleteAnchor) =>
    set((state) => ({ ...state, autocompleteAnchor })),
  setEventTarget: (eventTarget) => set((state) => ({ ...state, eventTarget })),
  setTargetString: (targetString) =>
    set((state) => ({ ...state, targetString })),
  setKvpTableAnchorEl: (kvpTableAnchorEl) =>
    set((state) => ({ ...state, kvpTableAnchorEl })),
}));
