export const SIDEBAR_WIDTH = "25em";
export const PAGE_SCALE = (1.1 * window.innerWidth) / 1440;
console.log("window.innerWidth, ", window.innerWidth);

export const DOC_IMAGE_WIDTH = 950;
export const MODAL_WIDTH = 700;
export const LOCAL_MODE = process.env.REACT_APP_LOCAL === "local";
export const API_PATH =
  process.env.REACT_APP_LOCAL === "local"
    ? ""
    : "https://docit-web.herokuapp.com";
export const ACC_SCORE_LARGE = 14;
export const ACC_SCORE_MEDIUM = 10;
export const ACC_SCORE_SMALL = 7;
