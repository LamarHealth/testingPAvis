import { getEditDistanceAndSort, KeyValuesByDoc } from "./KeyValuePairs";
import { renderAccuracyScore } from "./AccuracyScoreCircle";
import $ from "jquery";

interface LibertyInputsDictionary {
  [key: string]: string;
}

export const libertyInputsDictionary = {
  "CMCarrierBookingRef": "Carrier Booking Ref",
  // exclude forwarder, will already be there according to brandon
  "CMConsignee": "Consignee",
  "CMConsigneeName": "Consignee Name",
  "CMConsigneeEmail": "Consignee Email",
  "CMConsigneePhone": "Consignee Phone",
  "CMConsigneeFax": "Consignee Fax",
  // exclude POL etc
  "CMExportRef": "Export References",
  "CMShipper": "Shipper",
  "CMShipperName": "Shipper Name",
  "CMShipperEmail": "Shipper Email",
  "CMShipperPhone": "Shipper Phone",
  "CMShipperFax": "Shipper Fax",
  "CMNotify": "Notify Party",
  "CMNotifyName": "Notify Party Name",
  "CMNotifyEmail": "Notify Party Email",
  "CMNotifyPhone": "Notify Party Phone",
  "CMNotifyFax": "Notify Party Fax",
} as LibertyInputsDictionary;

export const assignTargetString = (inputEl: any) => {
  let targetString;
  const placeholderText = $(inputEl).attr("placeholder");
  if (placeholderText) {
    targetString = placeholderText;
  } else {
    const inputID = $(inputEl).attr("id");
    if (inputID && libertyInputsDictionary[inputID]) {
      targetString = libertyInputsDictionary[inputID];
    }
  }
  return targetString;
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
      renderAccuracyScore(selectEl, sortedKeyValuePairs[0]);
    } else if (valIsSufficiently("prepaid")) {
      $(selectEl).val(1);
      renderAccuracyScore(selectEl, sortedKeyValuePairs[0]);
    }
  }
};
