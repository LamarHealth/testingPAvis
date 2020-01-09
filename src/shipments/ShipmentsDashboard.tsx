import * as React from "react";
import DocViewer from "./DocViewer";
import { DocumentInfo } from "./DocViewer";

const placholder: DocumentInfo = {
  docName: "Doc 1231a",
  docType: "Bill of Lading",
  filePath: "123123"
};

class ShipmentsDashboard extends React.Component {
  render() {
    return <DocViewer documents={[placholder, placholder, placholder]} />;
  }
}

export default ShipmentsDashboard;
