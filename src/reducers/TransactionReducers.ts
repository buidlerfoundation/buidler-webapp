import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logoutAction } from "./actions";
import { TransactionApiData } from "models/User";

interface TransactionState {
  data: Array<TransactionApiData>;
  metadata: {
    page: number;
    canMore: boolean;
  };
  toastData: {
    title: string;
    message: string;
    hash: string;
    type: "success" | "error";
  } | null;
}

const initialState: TransactionState = {
  data: [],
  metadata: {
    page: 1,
    canMore: true,
  },
  toastData: null,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {},
  extraReducers: (builder) => builder.addCase(logoutAction, () => initialState),
});

export const TRANSACTION_ACTIONS = transactionSlice.actions;

export default transactionSlice.reducer;
