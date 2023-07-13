import { createAction } from "@reduxjs/toolkit";

export const logoutAction = createAction("user/logout");

export const channelChanged = createAction("channel/changed");
