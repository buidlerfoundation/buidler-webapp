import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ChainId from "services/connectors/ChainId";
import { logoutAction } from "./UserActions";

interface NetworkState {
  chainId: number | string;
  metaMaskAccount?: string;
}

const initialState: NetworkState = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || ChainId.EthereumMainnet,
  metaMaskAccount: "",
};

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    setMetaMaskAccount: (
      state: NetworkState,
      action: PayloadAction<string>
    ) => {
      state.metaMaskAccount = action.payload;
    },
    switchNetwork: (
      state: NetworkState,
      action: PayloadAction<string | number>
    ) => {
      state.chainId = action.payload;
    },
  },
  extraReducers: (builder) => builder.addCase(logoutAction, () => initialState),
});

export const NETWORK_ACTIONS = networkSlice.actions;

export default networkSlice.reducer;
