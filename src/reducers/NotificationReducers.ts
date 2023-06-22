import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logoutAction } from "./UserActions";
import { NotificationData, NotificationFilterType } from "models/Notification";

interface NotificationState {
  data: {
    All: NotificationData[];
    Mention: NotificationData[];
    Unread: NotificationData[];
  };
  canMore: boolean;
  currentFilter: NotificationFilterType;
}

const initialState: NotificationState = {
  data: {
    All: [],
    Mention: [],
    Unread: [],
  },
  canMore: false,
  currentFilter: "All",
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => builder.addCase(logoutAction, () => initialState),
});

export const NOTIFICATION_ACTIONS = notificationSlice.actions;

export default notificationSlice.reducer;
