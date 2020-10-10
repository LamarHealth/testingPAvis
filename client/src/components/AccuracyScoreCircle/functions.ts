import ReactDOM from "react-dom";
import $ from "jquery";

import uuidv from "uuid";

import {
  ACC_SCORE_LARGE,
  ACC_SCORE_SMALL,
  ACC_SCORE_MEDIUM,
} from "../../common/constants";
import {
  renderAccuracyScore,
  RenderAccuracyScoreActionTypes,
} from "./components";
import { KeyValuesByDoc, getEditDistanceAndSort } from "../KeyValuePairs";
import {
  assignTargetString,
  handleFreightTerms,
} from "../libertyInputsDictionary";

export enum PopulateFormsActionTypes {
  blankChiclets = "blank chiclets",
  bestGuess = "best guess",
}

export enum GetComputedDimensionActionTypes {
  height = "height",
  width = "width",
}

const getComputedStyle = (target: HTMLElement): CSSStyleDeclaration =>
  window.getComputedStyle(target);

export const getComputedDimension = (
  style: CSSStyleDeclaration,
  dimension: "height" | "width"
): number => {
  switch (dimension) {
    case "height":
      return parseInt(style.height.replace("px", ""));
    case "width":
      return parseInt(style.width.replace("px", ""));
  }
};

const hasDocitMounter = (target: HTMLElement): boolean =>
  target.className.includes("has-docit-mounter");

const findAccuracyScoreElDimensions = (
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

function positionMounter(
  target: HTMLElement,
  inputStyle: CSSStyleDeclaration,
  mounter: HTMLSpanElement,
  accuracyScoreElHeight: number,
  accuracyScoreElWidth: number
): void {
  const scopedInputHeight = getComputedDimension(inputStyle, "height");
  const scopedInputWidth = getComputedDimension(inputStyle, "width");

  mounter.style.top = `${
    (scopedInputHeight - accuracyScoreElHeight) / 2 + target.offsetTop
  }px`;
  mounter.style.left = `${
    scopedInputWidth + target.offsetLeft - (accuracyScoreElWidth + 5)
  }px`;
}

function positionAllMounters() {
  $(document).ready(function () {
    $("input").each(function () {
      if (this.offsetParent) {
        const inputStyle = getComputedStyle(this);
        const inputHeight = getComputedDimension(inputStyle, "height");
        const mounter = hasDocitMounter(this)
          ? (Array.from(this.offsetParent?.children).filter((el) =>
              el.id.includes("docit-accuracy-score-mounter")
            )[0] as HTMLSpanElement)
          : undefined;
        const {
          accuracyScoreElHeight,
          accuracyScoreElWidth,
        } = findAccuracyScoreElDimensions(inputHeight);
        if (mounter) {
          positionMounter(
            this,
            inputStyle,
            mounter,
            accuracyScoreElHeight,
            accuracyScoreElWidth
          );
        }
      }
    });
  });
}

export const setMounter = (target: HTMLElement) => {
  const inputStyle = getComputedStyle(target);
  const inputHeight = getComputedDimension(inputStyle, "height");
  const inputZIndex = target.style.zIndex;
  const {
    accuracyScoreElHeight,
    accuracyScoreElWidth,
  } = findAccuracyScoreElDimensions(inputHeight);
  const positionedParent = target.offsetParent;
  const mounter = document.createElement("span");
  //@ts-ignore
  const mounterID = uuidv();

  // remove the old mounter
  removeMounter(target);

  // add the new mounter
  mounter.id = `docit-accuracy-score-mounter-${mounterID}`;
  mounter.style.position = "absolute";
  mounter.style.zIndex =
    inputZIndex !== "" ? `${parseInt(inputZIndex) + 1}` : `${2}`;
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
  docID: string,
  action: "blank chiclets" | "best guess",
  docData?: KeyValuesByDoc[]
): void => {
  $(document).ready(() => {
    switch (action) {
      case "best guess":
        if (docData) {
          const keyValuePairs = docData.filter(
            (doc: KeyValuesByDoc) => doc.docID === docID
          )[0];
          $("select").each(function () {
            handleFreightTerms(this, keyValuePairs);
          });
          $("input").each(function () {
            const targetString = assignTargetString(this);
            if (typeof targetString !== "undefined") {
              const areThereKVPairs =
                Object.keys(keyValuePairs.keyValuePairs).length > 0
                  ? true
                  : false;
              if (areThereKVPairs) {
                const sortedKeyValuePairs = getEditDistanceAndSort(
                  keyValuePairs,
                  targetString,
                  "lc substring"
                );
                if (
                  sortedKeyValuePairs[0].distanceFromTarget > 0.5 &&
                  sortedKeyValuePairs[0].value !== ""
                ) {
                  renderAccuracyScore(
                    RenderAccuracyScoreActionTypes.value,
                    this,
                    sortedKeyValuePairs[0]
                  );
                  $(this).prop("value", sortedKeyValuePairs[0]["value"]);
                } else {
                  renderAccuracyScore(
                    RenderAccuracyScoreActionTypes.blank,
                    this
                  );
                  $(this).prop("value", null);
                }
              }
            }
          });
        } else throw new Error("docData is falsy");
        break;
      case "blank chiclets":
        $("input").each(function () {
          renderAccuracyScore(RenderAccuracyScoreActionTypes.blank, this);
        });
        break;
    }
    window.addEventListener("resize", positionAllMounters); // no need remove listener, as identical listeners are automatically discarded
  });
};

export const removeAllChiclets = () => {
  $(document).ready(function () {
    $("input").each(function () {
      removeMounter(this);
    });
  });
};
