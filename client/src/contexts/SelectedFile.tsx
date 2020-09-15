import React from "react";
import {
  createState as createSpecialHookState,
  useState as useSpecialHookState,
} from "@hookstate/core";

export const globalSelectedFileState = createSpecialHookState("");
