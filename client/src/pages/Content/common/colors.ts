export const colors = {
  RED: "red",
  BLUE: "#5b92e5",
  LIGHTBLUE: "#6bb9f9",
  OFFWHITE: "#f9f9f9",
  GREEN: "#379316",
  YELLOW: "#f9e526",
  WHITE: "#FFFFFF",
  TRANSPARENT: "hsla(0, 0%, 0%, 0)",

  // new styles
  LAYOUT_BLUE_SOLID: "hsla(210, 95%, 20%, 1)",
  LAYOUT_BLUE_CLEAR: "hsla(210, 95%, 20%, 0)",
  FONT_BLUE: "hsla(210, 95%, 10%, 1)",
  SIDEBAR_BACKGROUND: "white",
  DROPZONE_BACKGROUND_GREY: "hsla(140, 16%, 96%)",
  DROPZONE_TEXT_GREY: "	hsl(0, 0%, 50%)",
  DROPZONE_TEXT_LIGHTGREY: "hsl(0, 0%, 75%)",
  DROPZONE_BACKGROUND_HOVER_LIGHTBLUE:
    "linear-gradient(0.10turn, hsla(215, 91%, 79%, 0.3), hsla(252, 80%, 80%, 0.3))",
  DROPDOWN_TABLE_BACKGROUND: "white",
  DOC_CARD_BACKGROUND: "white",
  DOC_CARD_BORDER: "#918383",
  SELECTED_DOC_BACKGROUND:
    "linear-gradient(0.10turn, hsla(215, 91%, 79%, 0.3), hsla(252, 80%, 80%, 0.3))",
  FILL_BUTTON: "#22c062",
  MODAL_BORDER: "rgba(224, 224, 224, 1)",
  KVP_TABLE_BORDER: "hsla(0, 0%, 87%, 1)",
  CLOSEST_MATCH_ROW: "hsla(72, 69%, 74%, 0.4)",
  MANUAL_SELECT_BUTTON_YELLOW: "#f9e526",
  MANUAL_SELECT_HEADER: "hsla(72, 50%, 87%, 1)",
  MANUAL_SELECT_RECT_STROKE: "hsla(104, 74%, 33%, 1)",
  MANUAL_SELECT_RECT_FILL: "hsla(104, 74%, 33%, 0.4)",
  MANUAL_SELECT_RECT_FILL_YELLOW: "hsla(60, 100%, 50%, 0.4)",
  MANUAL_SELECT_RECT_HOVER: "hsla(104, 74%, 33%, 0.15)",
  MANUAL_SELECT_RECT_FILL_MOUSEDOWN: "hsla(104, 74%, 33%, 0.65)",
  MANUAL_SELECT_POPOVER_BACKDROP: "hsla(0, 0%, 0%, 0.4)",
  CURRENT_SELECTION_LIGHTBLUE: "hsla(204, 33%, 94%, 1)",
  ACCURACY_SCORE_LIGHTBLUE:
    "linear-gradient(0.10turn, hsla(215, 91%, 79%, 0.3), hsla(252, 80%, 80%, 0.3))",
  ERROR_BACKGROUND_RED: "rgb(244, 175, 173)",
};

export const colorSwitcher = (
  isSelected: boolean,
  cssAttribute: string,
  cssPrepends?: string,
  faintColor?: string,
  accentColor?: string
) =>
  `${cssAttribute}: ${
    isSelected
      ? `${cssPrepends ? cssPrepends : ""} ${
          accentColor ? accentColor : colors.FONT_BLUE
        }`
      : `${cssPrepends ? cssPrepends : ""} ${
          faintColor ? faintColor : colors.DROPZONE_TEXT_GREY
        }`
  }`;
