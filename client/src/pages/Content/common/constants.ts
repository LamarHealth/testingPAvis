enum envVars {
  LOCAL = "local",
  LIBERTY = "liberty",
  BUILD = "build",
}
export const SIDEBAR_WIDTH = "25em";
export const SIDEBAR_HEIGHT = "40em";
export const SIDEBAR_TRANSITION_TIME = "0.5s";
export const DOC_CARD_THUMBNAIL_WIDTH = "50px";
export const DOC_CARD_HEIGHT = "70px";
export const PAGE_SCALE = 0.1;
export const MODAL_SHADOW = "-1px 1px 6px 2px rgba(102, 102, 102, 0.30)";
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
export const LIBERTY_MODE = process.env.REACT_APP_LOCAL === envVars.LIBERTY;
export const API_PATH =
  process.env.REACT_APP_LOCAL === envVars.LOCAL // App is deployed for local testing
    ? "" // Path will be default localhost
    : process.env.REACT_APP_LOCAL === envVars.LIBERTY // Extension is packaged for Liberty
    ? "https://liberty-docit-demo.herokuapp.com"
    : process.env.REACT_APP_LOCAL === envVars.BUILD // Extension is packaged for general usage
    ? "https://docit-server.fly.dev"
    : "http://localhost:8080"; // Default to live path

const FILTER_ENABLED = process.env.REACT_APP_FILTER?.toLowerCase() === "false";

const filterName = FILTER_ENABLED ? '[data-docit-input="true"]' : "";
export const DOCIT_TAG = `input${filterName}, textarea${filterName}`;
export const ACC_SCORE_LARGE = 14;
export const ACC_SCORE_MEDIUM = 10;
export const ACC_SCORE_SMALL = 7;

export const PDF_UPLOAD_BUCKET = "plumbus-ocr-pdf-bucket";
export const OUTPUT_BUCKET = "plumbus-ocr-output-bucket";

export const POST_GENERATOR_API =
  "https://kuzoktnlpa.execute-api.us-east-1.amazonaws.com/default/doc-upload-url-generator";
export const OCR_URL =
  "https://c4lcvj97v5.execute-api.us-east-1.amazonaws.com/default/plumbus-doc-upload";
