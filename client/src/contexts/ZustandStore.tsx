import create from "zustand";

import {
  getKeyValuePairsByDoc,
  KeyValuesByDoc,
} from "../components/KeyValuePairs";

/** e.g. { some-uuid-34q4-jkdkjf-342fdfsf: {image: true, errorMessage: "some message", errorCode: 404} } */
export interface ErrorFile {
  [key: string]: {
    image?: boolean;
    geometry?: boolean;
    errorMessage?: string;
    errorCode?: number;
  };
}

type Uuid = string | null;

type State = {
  selectedFile: Uuid;
  selectedChiclet: Uuid;
  docData: KeyValuesByDoc[];
  konvaModalOpen: boolean;
  autocompleteAnchor: null | HTMLInputElement;
  eventTarget: null | HTMLInputElement;
  targetString: string;
  kvpTableAnchorEl: null | HTMLInputElement;
  errorFiles: ErrorFile; // not just one error file, but an object of error files
  setSelectedFile: (selectedFile: Uuid) => void;
  setSelectedChiclet: (selectedChiclet: Uuid) => void;
  setDocData: (docData: KeyValuesByDoc[]) => void;
  setKonvaModalOpen: (konvaModalOpen: boolean) => void;
  setAutocompleteAnchor: (
    autocompleteAnchorEl: null | HTMLInputElement
  ) => void;
  setEventTarget: (eventTarget: HTMLInputElement) => void;
  setTargetString: (targetString: string) => void;
  setKvpTableAnchorEl: (kvpTableAnchorEl: null | HTMLInputElement) => void;
  setErrorFiles: (errorFile: ErrorFile) => void;
};

export const useStore = create<State>((set) => ({
  selectedFile: null,
  selectedChiclet: null,
  docData: getKeyValuePairsByDoc(),
  konvaModalOpen: false,
  autocompleteAnchor: null,
  eventTarget: null,
  targetString: "",
  kvpTableAnchorEl: null,
  errorFiles: {},
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
  setErrorFiles: (errorFile) => {
    const docID = Object.entries(errorFile)[0][0];
    const payload = Object.entries(errorFile)[0][1];
    return set((state) => {
      return {
        ...state,
        errorFiles: {
          ...state.errorFiles,
          [docID]: { ...state.errorFiles[docID], ...payload },
        },
      };
    });
  },
}));

export const checkFileError = (errorFiles: ErrorFile, selectedFile: Uuid) => {
  return Boolean(
    selectedFile &&
      errorFiles[selectedFile] &&
      (errorFiles[selectedFile].image || errorFiles[selectedFile].geometry)
  );
};
