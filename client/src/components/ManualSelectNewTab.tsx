import React, { useEffect } from "react";
import { withRouter, useParams } from "react-router";
import { ManualSelect } from "./ManualSelect";

export const ManualSelectNewTab = () => {
  const params = useParams() as { docID: string };

  useEffect(() => {
    document.body.remove(); // get rid of rest of liberty page
  }, []);

  // this is is how ManualSelect knows it's being rendered in a new tab or not... whether it's being passed props. zustand store doesn't carry acrosss browsing contexts, so those specific vars have to be passed in as props.
  return (
    <div>
      <ManualSelect konvaModalOpen={true} selectedFile={params.docID} />
    </div>
  );
};

export default withRouter(ManualSelectNewTab);
