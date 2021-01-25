import { getEditDistanceAndSort, KeyValuesByDoc } from "./KeyValuePairs";
import {
  renderChiclets,
  RenderChicletsActionTypes,
} from "./ScoreChiclet/index";
import $ from "jquery";

interface LibertyInputsDictionary {
  [key: string]: string;
}
export const libertyInputsDictionary = {
  CMCarrierBookingRef: "Carrier Booking Ref",
  //////
  // according to Brandon: exclude forwarder. But we will include it for now, for demo purposes
  CMForwarderName: "Name",
  CMForwarderEmail: "Email",
  CMForwarderPhone: "Phone",
  CMForwarderFax: "Fax",
  //////
  CMConsignee: "Consignee",
  CMConsigneeName: "Name",
  CMConsigneeEmail: "Email",
  CMConsigneePhone: "Phone",
  CMConsigneeFax: "Fax",
  // exclude POL etc
  CMExportRef: "Export References",
  CMShipper: "Shipper",
  CMShipperName: "Shipper Name",
  CMShipperEmail: "Email",
  CMShipperPhone: "Phone",
  CMShipperFax: "Fax",
  CMNotify: "Notify Party",
  CMNotifyName: "Notify Party",
  CMNotifyEmail: "Email",
  CMNotifyPhone: "Phone",
  CMNotifyFax: "Fax",
} as LibertyInputsDictionary;

export const assignTargetString = (inputEl: any): string => {
  const inputID = $(inputEl).attr("id");
  const dictionaryLookup = inputID
    ? libertyInputsDictionary[inputID]
    : undefined;
  if (dictionaryLookup) return dictionaryLookup;

  const inputPlaceholder = $(inputEl).attr("placeholder");
  if (inputPlaceholder) return inputPlaceholder;

  const inputLabel = $(`label[for=${inputID}]`)[0]?.innerText;
  if (inputLabel) return inputLabel;

  return "";
};

export const handleFreightTerms = (
  selectEl: any,
  keyValuePairs: KeyValuesByDoc
) => {
  if ($(selectEl).attr("id") === "CMGeneralFreightTerms") {
    const sortedKeyValuePairs = getEditDistanceAndSort(
      keyValuePairs,
      "Freight Terms",
      "lc substring"
    );

    const valIsSufficiently = (val: "prepaid" | "collect") =>
      sortedKeyValuePairs[0].value.toLowerCase().includes(val) &&
      sortedKeyValuePairs[0].distanceFromTarget > 0.6;

    if (valIsSufficiently("collect")) {
      $(selectEl).val(2);
      renderChiclets(
        RenderChicletsActionTypes.value,
        selectEl,
        sortedKeyValuePairs[0]
      );
    } else if (valIsSufficiently("prepaid")) {
      $(selectEl).val(1);
      renderChiclets(
        RenderChicletsActionTypes.value,
        selectEl,
        sortedKeyValuePairs[0]
      );
    }
  }
};

export const getLibertyModalMutationsObserver = (callback: () => void) => {
  return new MutationObserver(function (mutationsList: MutationRecord[]) {
    for (let mutation of mutationsList) {
      // triggered when the 'Create Masters' modal opens and closes
      const changed = mutation.target as HTMLElement;
      if (changed.className.includes("modal-backdrop")) {
        callback(); // trigger callback on modal open/close
      }
    }
  });
};
