import { createState as createSpecialHookState } from "@hookstate/core";

import { getKeyValuePairsByDoc } from "../components/KeyValuePairs";

export const globalDocData = createSpecialHookState(getKeyValuePairsByDoc());
