import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./actions";
import { IFCUser } from "models/FC";
import api from "api";

interface FCUserState {
  data?: IFCUser | null;
  signer_id?: string;
  loginSource?: string;
}

const initialState: FCUserState = {
  data: null,
  loginSource: "",
};

export const getCurrentFCUser = createAsyncThunk("fc_user/get", async () => {
  const res = await api.getCurrentFCUser();
  if (res.success) {
    return res.data;
  }
});

const fcUserSlice = createSlice({
  name: "fc_user",
  initialState,
  reducers: {
    updateSignerId: (state, action: PayloadAction<string>) => {
      state.signer_id = action.payload;
    },
    updateLoginSource: (state, action: PayloadAction<string>) => {
      state.loginSource = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction, () => initialState)
      .addCase(getCurrentFCUser.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export const FC_USER_ACTIONS = fcUserSlice.actions;

export default fcUserSlice.reducer;
