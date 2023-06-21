import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logoutAction } from "./UserReducers";

const initialState: any = {};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    updateSession: (
      state: any,
      action: PayloadAction<{ key: string; value: string }>
    ) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
  },
  extraReducers: (builder) => builder.addCase(logoutAction, () => initialState),
});

export const SESSION_ACTIONS = sessionSlice.actions;

export default sessionSlice.reducer;
