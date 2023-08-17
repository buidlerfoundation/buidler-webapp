import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ENSAsset, NFTCollectionDataApi } from "models/User";
import { logoutAction } from "./actions";
import { IAnalyticData } from "models/Message";
import api from "api";

type AnalyticReducerState = {
  data?: IAnalyticData | null;
  loading?: boolean;
};

const initialState: AnalyticReducerState = {
  data: null,
  loading: false,
};

export const getAnalytic = createAsyncThunk(
  "analytic/get",
  async (payload: { communityUrl: string }) => {
    const res = await api.getAnalytics(payload.communityUrl);
    return res.data;
  }
);

const analyticSlice = createSlice({
  name: "analytic",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(logoutAction, () => initialState)
      .addCase(getAnalytic.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAnalytic.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getAnalytic.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      }),
});

export const ANALYTIC_ACTIONS = analyticSlice.actions;

export default analyticSlice.reducer;
