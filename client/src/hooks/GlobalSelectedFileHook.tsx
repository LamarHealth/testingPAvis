// method: https://medium.com/javascript-in-plain-english/state-management-with-react-hooks-no-redux-or-context-api-8b3035ceecf8
import { useState, useEffect } from "react";

let listeners: any = [];
let state: any = { selectedFile: "" };

const setState = (newState: any) => {
  state = { ...state, ...newState };
  listeners.forEach((listener: any) => {
    listener(state);
  });
};

const useGlobalSelectedFile = () => {
  const newListener = useState()[1];
  useEffect(() => {
    listeners.push(newListener);
  }, []);
  return [state, setState];
};

export default useGlobalSelectedFile;
