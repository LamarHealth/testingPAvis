import create from "zustand";

import {
  getKeyValuePairsByDoc,
  KeyValuesByDoc,
} from "../components/KeyValuePairs";

interface ErrorFile {
  [key: string]: { image?: boolean; geometry?: boolean }; // e.g. { some-uuid-34q4-jkdkjf-342fdfsf: {image: true} }
}

type State = {
  selectedFile: string;
  selectedChiclet: string;
  docData: KeyValuesByDoc[];
  konvaModalOpen: boolean;
  autocompleteAnchor: null | HTMLInputElement;
  eventTarget: null | HTMLInputElement;
  targetString: string;
  kvpTableAnchorEl: null | HTMLInputElement;
  errorFetchingImage: boolean;
  errorFetchingGeometry: boolean;
  errorMessage: string;
  errorCode: number;
  errorFiles: ErrorFile; // not just one error file, but an object of error files
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
  setErrorFetchingImage: (errorFetchingImage: boolean) => void;
  setErrorFetchingGeometry: (errorFetchingGeometry: boolean) => void;
  setErrorMessage: (errorMessage: string) => void;
  setErrorCode: (errorCode: number) => void;
  setErrorFiles: (errorFile: ErrorFile) => void;
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
  errorFetchingImage: false,
  errorFetchingGeometry: false,
  errorMessage: "Unable to fetch resources from server. Try again later.",
  errorCode: 400,
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
  setErrorFetchingImage: (errorFetchingImage) =>
    set((state) => ({ ...state, errorFetchingImage })),
  setErrorFetchingGeometry: (errorFetchingGeometry) =>
    set((state) => ({ ...state, errorFetchingGeometry })),
  setErrorMessage: (errorMessage) =>
    set((state) => ({ ...state, errorMessage })),
  setErrorCode: (errorCode) => set((state) => ({ ...state, errorCode })),
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
