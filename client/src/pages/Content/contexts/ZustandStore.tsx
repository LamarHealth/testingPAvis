/* global chrome */
import { create } from "zustand";

import { LOCAL_MODE } from "../common/constants";
import {
  getKeyValuePairsByDoc,
  KeyValuesByDoc,
} from "../components/KeyValuePairs";
import { LinesSelection } from "../components/ManualSelect";
import { Line } from "../../../types/documents";

/** e.g. { some-uuid-34q4-jkdkjf-342fdfsf: {image: true, errorMessage: "some message", errorCode: 404} } */
export interface ErrorFile {
  [key: string]: {
    image?: boolean;
    geometry?: boolean;
    errorMessage?: string;
    errorCode?: number;
  };
}

export type Uuid = string | null;

export type State = {
  openDocInNewTab: boolean;
  selectedFile: Uuid;
  fileUrl: string;
  lines: Line[];
  selectedChiclet: Uuid;
  docData: KeyValuesByDoc[];
  konvaModalOpen: boolean;
  autocompleteAnchor: null | HTMLInputElement | HTMLTextAreaElement;
  eventTarget: null | HTMLInputElement | HTMLTextAreaElement;
  targetString: string;
  kvpTableAnchorEl: null | HTMLInputElement | HTMLTextAreaElement;
  errorFiles: ErrorFile; // not just one error file, but an object of error files
  selectedLines: Line[];
  setOpenDocInNewTab: (openDocInNewTab: boolean) => void;
  setSelectedFile: (selectedFile: Uuid) => void;
  setFileUrl: (fileUrl: string) => void;
  setLines: (lines: Line[]) => void;
  setSelectedChiclet: (selectedChiclet: Uuid) => void;
  setDocData: (docData: KeyValuesByDoc[]) => void;
  setKonvaModalOpen: (konvaModalOpen: boolean) => void;
  setAutocompleteAnchor: (
    autocompleteAnchorEl: null | HTMLInputElement | HTMLTextAreaElement
  ) => void;
  setEventTarget: (eventTarget: HTMLInputElement | HTMLTextAreaElement) => void;
  setTargetString: (targetString: string) => void;
  setKvpTableAnchorEl: (
    kvpTableAnchorEl: null | HTMLInputElement | HTMLTextAreaElement
  ) => void;
  setErrorFiles: (errorFile: ErrorFile) => void;
  setSelectedLines: (selectedLines: Line[]) => void;
};

export const useStore = create<State>((set) => ({
  openDocInNewTab: false,
  selectedFile: null,
  fileUrl: "",
  lines: [],
  selectedChiclet: null,
  docData: getKeyValuePairsByDoc(),
  konvaModalOpen: false,
  autocompleteAnchor: null,
  eventTarget: null,
  targetString: "",
  kvpTableAnchorEl: null,
  errorFiles: {},
  selectedLines: [],
  setOpenDocInNewTab: (openDocInNewTab) =>
    set((state: State) => ({ ...state, openDocInNewTab })),
  setSelectedFile: (selectedFile) =>
    set((state: State) => {
      if (!LOCAL_MODE) {
        chrome.storage.local.set({ selectedFile });
      }
      return { ...state, selectedFile };
    }),
  setLines: (lines) => set((state: State) => ({ ...state, lines })),
  setFileUrl: (fileUrl) => set((state: State) => ({ ...state, fileUrl })),
  setSelectedChiclet: (selectedChiclet) =>
    set((state: State) => ({ ...state, selectedChiclet })),
  setDocData: (docData) =>
    set((state: State) => {
      if (!LOCAL_MODE) {
        chrome.storage.local.set({ docData });
      }
      return { ...state, docData };
    }),
  setKonvaModalOpen: (konvaModalOpen) =>
    set((state: State) => ({ ...state, konvaModalOpen })),
  setAutocompleteAnchor: (autocompleteAnchor) =>
    set((state: State) => ({ ...state, autocompleteAnchor })),
  setEventTarget: (eventTarget) =>
    set((state: State) => ({ ...state, eventTarget })),
  setTargetString: (targetString) =>
    set((state: State) => ({ ...state, targetString })),
  setKvpTableAnchorEl: (kvpTableAnchorEl) =>
    set((state: State) => ({ ...state, kvpTableAnchorEl })),
  setErrorFiles: (errorFile) => {
    const docID = Object.entries(errorFile)[0][0];
    const payload = Object.entries(errorFile)[0][1];
    return set((state: State) => {
      return {
        ...state,
        errorFiles: {
          ...state.errorFiles,
          [docID]: { ...state.errorFiles[docID], ...payload },
        },
      };
    });
  },
  setSelectedLines: (selectedLines) =>
    set((state: State) => ({ ...state, selectedLines })),
}));

export const checkFileError = (errorFiles: ErrorFile, selectedFile: Uuid) => {
  return Boolean(
    selectedFile &&
      errorFiles[selectedFile] &&
      (errorFiles[selectedFile].image || errorFiles[selectedFile].geometry)
  );
};
