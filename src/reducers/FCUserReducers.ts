import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./actions";
import { IFCChannel, IFCUser } from "models/FC";
import api from "api";

interface FCUserState {
  data?: IFCUser | null;
  signer_id?: string;
  loginSource?: string;
  channels: IFCChannel[];
}

const initialState: FCUserState = {
  data: null,
  loginSource: "",
  channels: [],
};

export const getCurrentFCUser = createAsyncThunk("fc_user/get", async () => {
  const res = await api.getCurrentFCUser();
  if (res.success) {
    return res.data;
  }
});

export const getFCChannels = createAsyncThunk(
  "fc_user/get-channels",
  async () => {
    const res = await api.getChannels();
    if (res.success) {
      return res.data;
    }
  }
);

export const loginWithMagicLink = createAsyncThunk(
  "fc_user/login-with-magic-link",
  async (payload: any) => {
    const res = await api.loginWithMagicLink(payload);
    return res;
  }
);

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
      .addCase(loginWithMagicLink.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.data = action.payload.data?.user;
          if (state.data && !state.data.display_name) {
            state.data.display_name = state.data.address?.slice(0, 7);
          }
        }
      })
      .addCase(getCurrentFCUser.fulfilled, (state, action) => {
        state.data = action.payload;
        if (state.data && !state.data.display_name) {
          state.data.display_name = state.data.address?.slice(0, 7);
        }
      })
      .addCase(getFCChannels.fulfilled, (state, action) => {
        state.channels = action.payload || [];
      });
  },
});

export const FC_USER_ACTIONS = fcUserSlice.actions;

export default fcUserSlice.reducer;
