import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logoutAction } from "./UserActions";

interface ConfigState {
  privateKey: string;
  seed: string;
  channelPrivateKey: { [key: string]: any };
  currentToken?: string;
  somethingWrong?: boolean | null;
  isOpenModalConfirmSignMessage?: boolean;
  internetConnection?: boolean;
  loginType?: string;
}

const initialState: ConfigState = {
  privateKey: "",
  seed: "",
  channelPrivateKey: {},
  currentToken: undefined,
  somethingWrong: null,
  isOpenModalConfirmSignMessage: false,
  internetConnection: true,
  loginType: "",
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    updateLoginType: (state: ConfigState, action: PayloadAction<string>) => {
      state.loginType = action.payload;
    },
    updateCurrentToken: (state: ConfigState, action: PayloadAction<string>) => {
      state.currentToken = action.payload;
    },
  },
  extraReducers: (builder) => builder.addCase(logoutAction, () => initialState),
});

export const CONFIG_ACTIONS = configSlice.actions;

export default configSlice.reducer;
