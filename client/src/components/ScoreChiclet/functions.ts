import ReactDOM from "react-dom";
import $ from "jquery";

import { v4 as uuidv4 } from "uuid";

import {
  ACC_SCORE_LARGE,
  ACC_SCORE_SMALL,
  ACC_SCORE_MEDIUM,
} from "../../common/constants";
import { renderChiclets, RenderChicletsActionTypes } from "./index";
import {
  KeyValuesByDoc,
  getEditDistanceAndSort,
  hasGoodHighestMatch,
} from "../KeyValuePairs";
import {
  assignTargetString,
  handleFreightTerms,
} from "../libertyInputsDictionary";

export enum PopulateFormsActionTypes {
  blankChiclets = "blank chiclets",
  bestGuess = "best guess",
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
    $("input, textarea").each(function () {
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

export const populateForms = (
  action: PopulateFormsActionTypes,
  keyValuePairs?: KeyValuesByDoc
): void => {
  $(document).ready(() => {
    switch (action) {
      case PopulateFormsActionTypes.bestGuess:
        if (keyValuePairs) {
          $("select").each(function () {
            handleFreightTerms(this, keyValuePairs);
          });
          $("input, textarea").each(function () {
            const targetString = assignTargetString(this);
            const areThereKVPairs =
              Object.keys(keyValuePairs.keyValuePairs).length > 0;
            if (areThereKVPairs) {
              const sortedKeyValuePairs = getEditDistanceAndSort(
                keyValuePairs,
                targetString,
                "lc substring"
              );
              if (hasGoodHighestMatch(sortedKeyValuePairs)) {
                renderChiclets(
                  RenderChicletsActionTypes.value,
                  this,
                  sortedKeyValuePairs[0]
                );
                $(this).prop("value", sortedKeyValuePairs[0]["value"]);
              } else {
                renderChiclets(RenderChicletsActionTypes.blank, this);
                $(this).prop("value", null);
              }
            }
          });
        } else console.error("keyValuePairs is falsy");
        break;
      case PopulateFormsActionTypes.blankChiclets:
        $("input, textarea").each(function () {
          renderChiclets(RenderChicletsActionTypes.blank, this);
        });
        break;
    }
    window.addEventListener("resize", positionAllMounters); // no need remove listener, as identical listeners are automatically discarded
  });
};

export const removeAllChiclets = () => {
  $(document).ready(function () {
    $("input, textarea").each(function () {
      removeMounter(this);
    });
  });
};
