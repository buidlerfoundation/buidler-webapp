import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICast } from "models/FC";
import api from "api";
import {
  deleteCast,
  getCastReplies,
  getResultCastByHash,
} from "./HomeFeedReducers";

interface FCCastState {
  data: ICast[];
  total?: number;
  currentPage: number;
  canMore: boolean;
  loading: boolean;
  loadMore: boolean;
  queryUrl: string;
  metadata: {
    loading: boolean;
    titleUrl: string;
  };
  replyCast?: ICast;
  openNewCast: boolean;
}

const initialState: FCCastState = {
  data: [],
  currentPage: 1,
  canMore: false,
  loading: true,
  loadMore: false,
  queryUrl: "",
  openNewCast: false,
  metadata: {
    loading: false,
    titleUrl: "",
  },
};

export const getCastsByUrl = createAsyncThunk(
  "fc_cast/get",
  async (payload: { text: string; page: number; limit: number }) => {
    const res = await api.listCasts(payload);
    return res;
  }
);

export const getMainMetadata = createAsyncThunk(
  "fc_cast/get-metadata",
  async (payload: string) => {
    const res = await api.getEmbeddedMetadata(payload);
    return res;
  }
);

const fcCastSlice = createSlice({
  name: "fc_cast",
  initialState,
  reducers: {
    updateQueryUrl: (state, action: PayloadAction<string>) => {
      if (state.queryUrl !== action.payload) {
        state.queryUrl = action.payload;
      }
    },
    updateTitleUrl: (state, action: PayloadAction<string>) => {
      state.metadata = { loading: false, titleUrl: action.payload };
    },
    updateReplyCast: (state, action: PayloadAction<ICast | undefined>) => {
      state.replyCast = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
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
      })
      .addCase(getResultCastByHash.fulfilled, (state, action) => {
        const { query_url } = action.meta.arg;
        if (query_url && action.payload.data) {
          state.data = [action.payload.data, ...state.data];
        }
      })
      .addCase(getMainMetadata.pending, (state) => {
        state.metadata = {
          loading: true,
          titleUrl: state.metadata.titleUrl,
        };
      })
      .addCase(getCastReplies.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.data = state.data.map((el) => {
            if (el.hash === action.meta.arg.hash) {
              return action.payload.data || el;
            }
            return el;
          });
        }
      })
      .addCase(deleteCast.fulfilled, (state, action) => {
        if (action.payload.success) {
          const cast = action.meta.arg;
          state.data = state.data.filter((el) => el.hash !== cast.hash);
        }
      })
      .addCase(getMainMetadata.rejected, (state) => {
        state.metadata = {
          loading: false,
          titleUrl: state.metadata.titleUrl,
        };
      })
      .addCase(getMainMetadata.fulfilled, (state, action) => {
        state.metadata = {
          loading: false,
          titleUrl: action.payload?.data?.title || state.metadata.titleUrl,
        };
      });
  },
});

export const FC_CAST_ACTIONS = fcCastSlice.actions;

export default fcCastSlice.reducer;
