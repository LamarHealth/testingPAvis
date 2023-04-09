/* global chrome */
import React, { useEffect, useState } from "react";
import { LOCAL_MODE } from "../common/constants";
import { ManualSelect } from "./ManualSelect";
import { KeyValuesByDoc } from "./KeyValuePairs";

interface ChromeStorage {
  selectedFile?: string;
  docData?: KeyValuesByDoc[];
}

export const ManualSelectNewTab = () => {
  const [docID, setDocID] = useState(undefined as string | undefined);
  const [docData, setDocData] = useState(
    undefined as KeyValuesByDoc[] | undefined
  );

  useEffect(() => {
    if (!LOCAL_MODE) {
      chrome.storage.local.get((items: ChromeStorage) => {
        if (items.selectedFile) {
          setDocID(items.selectedFile);
        }
        if (items.docData) {
          setDocData(items.docData);
        }
      });
    }
  }, []);

  // this is is how ManualSelect knows it's being rendered in a new tab or not... whether it's being passed props. zustand store doesn't carry acrosss browsing contexts, so those specific vars have to be passed in as props.
  return (
    <div>
      {docID && docData && (
        <ManualSelect
          isInNewTab
          konvaModalOpen={true}
          selectedFile={docID}
          docData={docData}
        />
      )}
    </div>
  );
};

export default ManualSelectNewTab;
