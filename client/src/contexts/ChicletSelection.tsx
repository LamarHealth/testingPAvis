import React from "react";

import { createState as createSpecialHookState } from "@hookstate/core";

export const globalSelectedChiclet = createSpecialHookState("" as string);
