import { getEditDistanceAndSort } from "./KeyValuePairs";
import {
  renderChiclets,
  RenderChicletsActionTypes,
} from "./ScoreChiclet/index";
import $ from "jquery";
import { LIBERTY_MODE } from "../common/constants";
import { KeyValuePairs } from "../../../types/documents";

interface InputsDictionary {
  [key: string]: string;
}
const libertyInputsDictionary = {
  CMCarrierBookingRef: "Carrier Booking Ref",
  // according to Brandon: exclude forwarder
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
} as InputsDictionary;

const addlLibertyDemoDictionary = {
  CMPOL: "Port of Loading",
  CMPOD: "Port of Departure",
  CMNRT: "Not Register Tonnage",
  CMGRT: "Gross Register Tonnage",
  CMForwarderName: "Name",
  CMForwarderEmail: "Email",
  CMForwarderPhone: "Phone",
  CMForwarderFax: "Fax",
} as InputsDictionary;

const inputsDictionary = (
  LIBERTY_MODE
    ? libertyInputsDictionary
    : {
        ...addlLibertyDemoDictionary,
        ...libertyInputsDictionary,
      }
) as InputsDictionary;

export const assignTargetString = (inputEl: any): string => {
  // Use jQuery to get the "name" attribute of the input element
  const inputName = $(inputEl).attr("name");
  
  // Check if the name contains the substring 'gender'
  if (inputName && inputName.includes('gender')) {
    //const value = $(inputEl).val();
    //return value ? value.toString() : "";  // Convert the value to string
    return 'gender';
  }

  if (inputName) {
    const modifiedInputName = inputName.replace(/_/g, ' ');
    return modifiedInputName;
  }

  // If "name" is not available, check the dictionary using the input's ID
  const inputID = $(inputEl).attr("id");
  if (inputID) {
    const modifiedInputID = inputID.replace(/_/g, ' ');
    return modifiedInputID;
  }

  // If neither "name" nor dictionary lookup is available, use the "placeholder" attribute
  const inputPlaceholder = $(inputEl).attr("placeholder");
  if (inputPlaceholder) return inputPlaceholder;

  // If none of the above are available, try to get the associated label using the input's ID
  const inputLabel: string | undefined = $(`label[for=${inputID}]`)[0]?.innerText;
  if (inputLabel) return inputLabel;

  return "";
};


export const handleFreightTerms = (
  selectEl: any,
  keyValuePairs: KeyValuePairs
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
