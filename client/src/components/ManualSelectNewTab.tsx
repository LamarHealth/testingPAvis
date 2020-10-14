import React, { useEffect } from "react";
import { withRouter, useParams } from "react-router";
import { ManualSelect } from "./ManualSelect";

export const ManualSelectNewTab = () => {
  const params = useParams() as { docID: string };

  useEffect(() => {
    document.body.remove(); // get rid of rest of liberty page
  }, []);

  return (
    <div>
      <ManualSelect konvaModalOpen={true} selectedFile={params.docID} />
    </div>
  );
};

export default withRouter(ManualSelectNewTab);
