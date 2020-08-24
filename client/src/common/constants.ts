enum envVars {
  LOCAL = "local",
  LIBERTY = "liberty",
  BUILD = "build",
}
export const SIDEBAR_WIDTH = "25em";
export const PAGE_SCALE = 0.5;
export const MODAL_SHADOW = "0px 0px 15px 3px rgba(102, 102, 102, 0.15)";
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
export const KONVA_MODAL_LEFT_BOUND =
  -KONVA_MODAL_OFFSET_X - DOC_IMAGE_WIDTH + 70;
export const KONVA_MODAL_TOP_BOUND =
  -KONVA_MODAL_OFFSET_Y - KONVA_MODAL_HEIGHT + 70;
export const KONVA_MODAL_RIGHT_BOUND =
  DOC_IMAGE_WIDTH + KONVA_MODAL_OFFSET_X - 70;
export const KONVA_MODAL_BOTTOM_BOUND =
  window.innerHeight - KONVA_MODAL_OFFSET_Y - 70;
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
