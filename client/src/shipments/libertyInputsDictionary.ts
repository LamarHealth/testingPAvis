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
  const placeholderText = inputEl.attr("placeholder");
  if (placeholderText) {
    targetString = placeholderText;
  } else {
    const inputID = inputEl.attr("id");
    if (inputID && libertyInputsDictionary[inputID]) {
      targetString = libertyInputsDictionary[inputID];
    }
  }
  return targetString;
};
