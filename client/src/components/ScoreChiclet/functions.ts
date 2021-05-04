import ReactDOM from "react-dom";
import $ from "jquery";

import { v4 as uuidv4 } from "uuid";

import {
  ACC_SCORE_LARGE,
  ACC_SCORE_SMALL,
  ACC_SCORE_MEDIUM,
  DOCIT_TAG,
} from "../../common/constants";
import { renderChiclets, RenderChicletsActionTypes } from "./index";
import {
  KeyValuesByDoc,
  getEditDistanceAndSort,
  hasGoodHighestMatch,
} from "../KeyValuePairs";
import { assignTargetString, handleFreightTerms } from "../inputsDictionary";

export enum PopulateFormsActionTypes {
  overwriteAll = "all",
  overwriteBlank = "blank",
}

export enum ComputedDimensionTypes {
  height = "height",
  width = "width",
}

const getComputedStyle = (target: HTMLElement): CSSStyleDeclaration =>
  window.getComputedStyle(target);

export const getComputedDimension = (
  style: CSSStyleDeclaration,
  dimension: ComputedDimensionTypes
): number => {
  switch (dimension) {
    case ComputedDimensionTypes.height:
      return parseInt(style.height.replace("px", ""));
    case ComputedDimensionTypes.width:
      return parseInt(style.width.replace("px", ""));
  }
};

const hasDocitMounter = (target: HTMLElement): boolean =>
  target.className.includes("has-docit-mounter");

const getChicletDimensions = (
  inputHeight: number
): { accuracyScoreElHeight: number; accuracyScoreElWidth: number } => {
  const accuracyScoreElHeight =
    inputHeight >= 30
      ? ACC_SCORE_LARGE + 8
      : inputHeight >= 20
      ? ACC_SCORE_MEDIUM + 8
      : ACC_SCORE_SMALL + 8;
  const accuracyScoreElWidth =
    inputHeight >= 30
      ? ACC_SCORE_LARGE + 40
      : inputHeight >= 20
      ? ACC_SCORE_MEDIUM + 32
      : ACC_SCORE_SMALL + 26;

  return { accuracyScoreElHeight, accuracyScoreElWidth };
};

const removeMounter = (target: HTMLElement): void => {
  if (hasDocitMounter(target)) {
    const oldMounterClassExec = /(has-docit-mounter-(\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b))/.exec(
      target.className
    ) as RegExpExecArray;
    const oldMounterClassName = oldMounterClassExec[0];
    const oldMounterID = oldMounterClassName.replace("has-docit-mounter-", "");
    const oldMounter = document.getElementById(
      `docit-accuracy-score-mounter-${oldMounterID}`
    ) as HTMLElement;

    ReactDOM.unmountComponentAtNode(oldMounter); // unmount React component from old mounter
    target.classList.remove(oldMounterClassName); // remove old class name from targeted inputEl
    oldMounter.remove(); // remove mounter from DOM
  }
};

const createMounter = (
  target: HTMLElement
): { mounter: HTMLSpanElement; mounterID: string } => {
  const inputZIndex = target.style.zIndex;
  const mounter = document.createElement("span");
  const mounterID = uuidv4();
  mounter.id = `docit-accuracy-score-mounter-${mounterID}`;
  mounter.style.position = "absolute";
  mounter.style.zIndex =
    inputZIndex !== "" ? `${parseInt(inputZIndex) + 1}` : `${2}`;
  return { mounter, mounterID };
};

const positionMounter = (
  target: HTMLElement,
  inputStyle: CSSStyleDeclaration,
  mounter: HTMLSpanElement,
  accuracyScoreElHeight: number,
  accuracyScoreElWidth: number
): void => {
  const scopedInputHeight = getComputedDimension(
    inputStyle,
    ComputedDimensionTypes.height
  );
  const scopedInputWidth = getComputedDimension(
    inputStyle,
    ComputedDimensionTypes.width
  );

  mounter.style.top = `${
    (scopedInputHeight - accuracyScoreElHeight) / 2 + target.offsetTop
  }px`;
  mounter.style.left = `${
    scopedInputWidth + target.offsetLeft - (accuracyScoreElWidth + 5)
  }px`;
};

function positionAllMounters() {
  $(document).ready(function () {
    $(DOCIT_TAG).each(function () {
      if (this.offsetParent) {
        const inputStyle = getComputedStyle(this);
        const inputHeight = getComputedDimension(
          inputStyle,
          ComputedDimensionTypes.height
        );
        const mounter = hasDocitMounter(this)
          ? (Array.from(this.offsetParent?.children).filter((el) =>
              el.id.includes("docit-accuracy-score-mounter")
            )[0] as HTMLSpanElement)
          : undefined;
        const {
          accuracyScoreElHeight,
          accuracyScoreElWidth,
        } = getChicletDimensions(inputHeight);
        mounter &&
          positionMounter(
            this,
            inputStyle,
            mounter,
            accuracyScoreElHeight,
            accuracyScoreElWidth
          );
      }
    });
  });
}

export const replaceAndSetNewMounter = (
  target: HTMLElement
): { mounter: HTMLSpanElement; mounterID: string } => {
  const inputStyle = getComputedStyle(target);
  const inputHeight = getComputedDimension(
    inputStyle,
    ComputedDimensionTypes.height
  );
  const { accuracyScoreElHeight, accuracyScoreElWidth } = getChicletDimensions(
    inputHeight
  );
  const positionedParent = target.offsetParent;

  // remove the old mounter
  removeMounter(target);

  // add the new mounter
  const { mounter, mounterID } = createMounter(target);

  positionMounter(
    target,
    inputStyle,
    mounter,
    accuracyScoreElHeight,
    accuracyScoreElWidth
  );

  target.className += ` has-docit-mounter-${mounterID}`; // add class to link to chiclet
  positionedParent && positionedParent.appendChild(mounter); // append mounter

  return { mounter, mounterID };
};

/**
 * For each element on the pageg, render chiclets and populate fields
 * with their respective kvp matches. This function will perform distance metric matching
 * against the labels of the existing document and determine which string best matches with
 * the corresponding text.
 * @param {PopulateFormsActionTypes} action - Instruction whether or not to overwrite
 * elements with existing text or overwrite all
 * @param {KeyValuesByDoc} [keyValuePairs] - KVP values extracted from OCR
 */
export const populateForms = (
  action: PopulateFormsActionTypes,
  keyValuePairs: KeyValuesByDoc
): void => {
  if (Object.keys(keyValuePairs.keyValuePairs).length == 0) {
    console.error("No Key Value Pairs found");
    return;
  }
  $(document).ready(() => {
    $("select").each((ndx, el) => {
      handleFreightTerms(el, keyValuePairs);
    });
    $(DOCIT_TAG).each((ndx, el) => {
      const targetString = assignTargetString(el);
      const sortedKeyValuePairs = getEditDistanceAndSort(
        keyValuePairs,
        targetString,
        "lc substring"
      );
      const elText = $(el).prop("value");
      if (!!!elText && action == PopulateFormsActionTypes.overwriteBlank) {
        if (hasGoodHighestMatch(sortedKeyValuePairs)) {
          renderChiclets(
            RenderChicletsActionTypes.value,
            el,
            sortedKeyValuePairs[0]
          );
          $(el).prop("value", sortedKeyValuePairs[0]["value"]);
        } else {
          renderChiclets(RenderChicletsActionTypes.blank, el);
          $(el).prop("value", null);
        }
      }
    });
    window.addEventListener("resize", positionAllMounters); // no need remove listener, as identical listeners are automatically discarded
  });
};

export const populateBlankChicklets = () => {
  $(DOCIT_TAG).each(function () {
    renderChiclets(RenderChicletsActionTypes.blank, this);
  });
};

export const removeAllChiclets = () => {
  $(document).ready(function () {
    $(DOCIT_TAG).each(function () {
      removeMounter(this);
    });
  });
};
