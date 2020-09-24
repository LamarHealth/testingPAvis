import { VoidExpression } from "typescript";
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
  setSelectedFile: (selectedFile: string) => void;
  setSelectedChiclet: (selectedChiclet: string) => void;
  setDocData: (docData: KeyValuesByDoc[]) => void;
  setKonvaModalOpen: (konvaModalOpen: boolean) => void;
  setAutocompleteAnchor: (
    autocompleteAnchorEl: null | HTMLInputElement
  ) => void;
};

export const useStore = create<State>((set) => ({
  selectedFile: "",
  selectedChiclet: "",
  docData: getKeyValuePairsByDoc(),
  konvaModalOpen: false,
  autocompleteAnchor: null,
  setSelectedFile: (selectedFile) =>
    set((state) => ({ ...state, selectedFile })),
  setSelectedChiclet: (selectedChiclet) =>
    set((state) => ({ ...state, selectedChiclet })),
  setDocData: (docData) => set((state) => ({ ...state, docData })),
  setKonvaModalOpen: (konvaModalOpen) =>
    set((state) => ({ ...state, konvaModalOpen })),
  setAutocompleteAnchor: (autocompleteAnchor) =>
    set((state) => ({ ...state, autocompleteAnchor })),
}));
