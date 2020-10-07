enum envVars {
  LOCAL = "local",
  LIBERTY = "liberty",
  BUILD = "build",
}
export const SIDEBAR_WIDTH = "25em";
export const SIDEBAR_TRANSITION_TIME = "0.5s";
export const PAGE_SCALE = 0.5;
export const MODAL_SHADOW = "0px 0px 15px 3px rgba(102, 102, 102, 0.15)";
export const KONVA_MODAL_STICKY_HEADER_SHADOW =
  "0px 8px 15px -8px rgba(102, 102, 102, 0.15)";
export const MAIN_MODAL_WIDTH = 700;
export const MAIN_MODAL_OFFSET_Y = 100;
export const MAIN_MODAL_OFFSET_X = (window.innerWidth - MAIN_MODAL_WIDTH) / 2;
export const MAIN_MODAL_LEFT_BOUND =
  -MAIN_MODAL_OFFSET_X - MAIN_MODAL_WIDTH + 70;
export const MAIN_MODAL_RIGHT_BOUND =
  MAIN_MODAL_WIDTH + MAIN_MODAL_OFFSET_X - 70;
export const MAIN_MODAL_BOTTOM_BOUND =
  window.innerHeight - MAIN_MODAL_OFFSET_Y - 70;
export const DOC_IMAGE_WIDTH = window.innerWidth * (2 / 3);
export const KONVA_MODAL_HEIGHT = window.innerHeight * (6 / 7);
export const KONVA_MODAL_OFFSET_Y = 25;
export const KONVA_MODAL_OFFSET_X = (window.innerWidth - DOC_IMAGE_WIDTH) / 2;
export const Z_INDEX_ALLOCATOR = {
  baseIndex: 0,
  body: function () {
    return this.baseIndex + 0;
  },
  insertionPoint: function () {
    return this.baseIndex + 1;
  },
  sidebar: function () {
    return this.baseIndex + 2;
  },
  modals: function () {
    return this.baseIndex + 3;
  },
};
export const DEFAULT_ERROR_MESSAGE =
  "Unable to fetch resources from server. Try again later.";

// If LOCAL_MODE is enabled, then the app will render a mock dashboard for testing
export const LOCAL_MODE = process.env.REACT_APP_LOCAL === envVars.LOCAL;
export const API_PATH =
  process.env.REACT_APP_LOCAL === envVars.LOCAL // App is deployed for local testing
    ? "" // Path will be default localhost
    : process.env.REACT_APP_LOCAL === envVars.LIBERTY // Extension is packaged for Liberty
    ? "https://liberty-docit-demo.herokuapp.com"
    : process.env.REACT_APP_LOCAL === envVars.BUILD // Extension is packaged for general usage
    ? "https://docit-web.herokuapp.com"
    : "https://docit-web.herokuapp.com"; // Default to live path
export const ACC_SCORE_LARGE = 14;
export const ACC_SCORE_MEDIUM = 10;
export const ACC_SCORE_SMALL = 7;
