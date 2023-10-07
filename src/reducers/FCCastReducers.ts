import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
  titleUrl: string;
  replyCast?: ICast;
  castDetail: {
    data?: ICast;
    loading: boolean;
  };
  castRepliesMap: {
    [key: string]: {
      loading: boolean;
      data: ICast[];
    };
  };
  openNewCast: boolean;
}

const initialState: FCCastState = {
  data: [],
  currentPage: 1,
  canMore: false,
  loading: false,
  loadMore: false,
  queryUrl: "",
  titleUrl: "",
  castDetail: {
    loading: false,
  },
  castRepliesMap: {},
  openNewCast: false,
};

export const getCastDetail = createAsyncThunk(
  "fc_cast/get-by-hash",
  async (payload: { hash: string }) => {
    const res = await api.getCastDetail(payload.hash);
    return res;
  }
);

export const getCastReplies = createAsyncThunk(
  "fc_cast/get-replies",
  async (payload: { hash: string }) => {
    const res = await api.getCastDetail(payload.hash);
    return res;
  }
);

export const getCastsByUrl = createAsyncThunk(
  "fc_cast/get",
  async (payload: { text: string; page: number; limit: number }) => {
    const res = await api.listCasts(payload);
    return res;
  }
);

export const deleteCast = createAsyncThunk(
  "fc_cast/delete",
  async (payload: ICast) => {
    const res = await api.deleteCast(payload.hash);
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
    updateTitleUrl: (state, action: PayloadAction<string>) => {
      state.titleUrl = action.payload;
    },
    updateReplyCast: (state, action: PayloadAction<ICast | undefined>) => {
      state.replyCast = action.payload;
    },
    toggleNewCast: (state) => {
      state.openNewCast = !state.openNewCast;
    },
    openNewCast: (state) => {
      state.openNewCast = true;
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
      .addCase(getCastDetail.pending, (state, action) => {
        state.castDetail = {
          loading: true,
        };
      })
      .addCase(getCastDetail.rejected, (state, action) => {
        state.castDetail = {
          loading: false,
        };
      })
      .addCase(getCastDetail.fulfilled, (state, action) => {
        state.castDetail = {
          loading: false,
          data: action.payload.data,
        };
        state.castRepliesMap = {
          [action.meta.arg.hash]: {
            loading: false,
            data: action.payload.data?.replies?.casts || [],
          },
        };
      })
      .addCase(getCastReplies.pending, (state, action) => {
        const hash = action.meta.arg.hash;
        state.castRepliesMap[hash] = {
          loading: true,
          data: state.castRepliesMap?.[hash]?.data || [],
        };
      })
      .addCase(getCastReplies.rejected, (state, action) => {
        const hash = action.meta.arg.hash;
        state.castRepliesMap[hash] = {
          loading: false,
          data: state.castRepliesMap?.[hash]?.data || [],
        };
      })
      .addCase(getCastReplies.fulfilled, (state, action) => {
        const hash = action.meta.arg.hash;
        state.castRepliesMap[hash] = {
          loading: false,
          data: action.payload.data?.replies?.casts || [],
        };
        if (action.payload.success) {
          if (
            state.castRepliesMap &&
            action.payload.data?.parent_hash &&
            state.castRepliesMap[action.payload.data?.parent_hash]
          ) {
            state.castRepliesMap[action.payload.data.parent_hash].data =
              state.castRepliesMap[action.payload.data.parent_hash].data.map(
                (el) => {
                  if (el.hash === action.payload.data?.hash) {
                    return action.payload.data || el;
                  }
                  return el;
                }
              );
          }
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
          if (cast.parent_hash && state.castRepliesMap?.[cast.parent_hash]) {
            state.castRepliesMap[cast.parent_hash].data = state.castRepliesMap[
              cast.parent_hash
            ].data.filter((el) => el.hash !== cast.hash);
          }
          state.data = state.data.filter((el) => el.hash !== cast.hash);
        }
      });
  },
});

export const FC_CAST_ACTIONS = fcCastSlice.actions;

export default fcCastSlice.reducer;
