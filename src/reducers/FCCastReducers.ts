import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./actions";
import { ICast } from "models/FC";
import api from "api";

interface FCCastState {
  data: ICast[];
  total?: number;
  currentPage: number;
  canMore: boolean;
  loading: boolean;
  loadMore: boolean;
  queryUrl: string;
  replyCast?: ICast;
}

const initialState: FCCastState = {
  data: [],
  currentPage: 1,
  canMore: false,
  loading: false,
  loadMore: false,
  queryUrl: "",
};

export const getCastsByUrl = createAsyncThunk(
  "fc_cast/get",
  async (payload: { text: string; page: number; limit: number }) => {
    const res = await api.listCasts(payload);
    return res;
  }
);

const fcCastSlice = createSlice({
  name: "fc_cast",
  initialState,
  reducers: {
    updateQueryUrl: (state, action: PayloadAction<string>) => {
      state.queryUrl = action.payload;
    },
    updateReplyCast: (state, action: PayloadAction<ICast | undefined>) => {
      state.replyCast = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction, (state) => {
        state.data = initialState.data;
      })
      .addCase(getCastsByUrl.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.loading = true;
        } else {
          state.loadMore = true;
        }
      })
      .addCase(getCastsByUrl.fulfilled, (state, action) => {
        const total = action.payload.metadata?.total || 0;
        const limit = action.meta.arg.limit;
        const totalPage = Math.ceil(total / limit);
        const currentPage = action.meta.arg.page;
        const data = action.payload?.data || [];
        state.data = currentPage === 1 ? data : [...state.data, ...data];
        state.loadMore = false;
        state.loading = false;
        state.total = total;
        state.canMore = totalPage > currentPage;
        state.currentPage = currentPage;
      });
  },
});

export const FC_CAST_ACTIONS = fcCastSlice.actions;

export default fcCastSlice.reducer;
