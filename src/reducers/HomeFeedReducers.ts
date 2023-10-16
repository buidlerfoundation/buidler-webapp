import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICast, IFCFilterType } from "models/FC";
import api from "api";

interface HomeFeedState {
  feedMap: {
    [key: string]: {
      data: ICast[];
      total?: number;
      currentPage?: number;
      canMore?: boolean;
      loading?: boolean;
      loadMore?: boolean;
    };
  };
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
  filters: IFCFilterType[];
  currentFilter: IFCFilterType;
}

const initialState: HomeFeedState = {
  feedMap: {},
  castDetail: {
    loading: false,
  },
  castRepliesMap: {},
  openNewCast: false,
  filters: [
    { label: "trending", id: "1" },
    { label: "newest", id: "2" },
    { label: "by domain", id: "3" },
  ],
  currentFilter: { label: "trending", id: "1" },
};

export const getCastDetail = createAsyncThunk(
  "home-feed/get-by-hash",
  async (payload: { hash: string }) => {
    const res = await api.getCastDetail(payload.hash);
    return res;
  }
);

export const getCastReplies = createAsyncThunk(
  "home-feed/get-replies",
  async (payload: { hash: string }) => {
    const res = await api.getCastDetail(payload.hash);
    return res;
  }
);

export const getFeed = createAsyncThunk(
  "home-feed/get",
  async (payload: { type: string; page: number; limit: number }) => {
    const res = await api.getHomeFeed(payload);
    return res;
  }
);

export const deleteCast = createAsyncThunk(
  "home-feed/delete",
  async (payload: ICast) => {
    const res = await api.deleteCast(payload.hash);
    return res;
  }
);

const homeFeedSlice = createSlice({
  name: "home-feed",
  initialState,
  reducers: {
    updateReplyCast: (state, action: PayloadAction<ICast | undefined>) => {
      state.replyCast = action.payload;
    },
    updateFilter: (state, action: PayloadAction<IFCFilterType>) => {
      state.currentFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeed.pending, (state, action) => {
        const { page, type } = action.meta.arg;
        if (page === 1) {
          state.feedMap[type] = {
            ...(state.feedMap[type] || {}),
            loading: true,
          };
        } else {
          state.feedMap[type] = {
            ...(state.feedMap[type] || {}),
            loadMore: true,
          };
        }
      })
      .addCase(getFeed.fulfilled, (state, action) => {
        const total = action.payload.metadata?.total || 0;
        const limit = action.meta.arg.limit;
        const type = action.meta.arg.type;
        const totalPage = Math.ceil(total / limit);
        const currentPage = action.meta.arg.page;
        const data = action.payload?.data || [];
        state.feedMap[type] = {
          loading: false,
          loadMore: false,
          currentPage,
          total,
          canMore: totalPage > currentPage,
          data:
            currentPage === 1
              ? data
              : [...(state.feedMap?.[type]?.data || []), ...data],
        };
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
          if (state.feedMap?.[state.currentFilter.label]) {
            state.feedMap[state.currentFilter.label].data = state.feedMap[
              state.currentFilter.label
            ].data.map((el) => {
              if (el.hash === action.meta.arg.hash) {
                return action.payload.data || el;
              }
              return el;
            });
          }
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
          if (state.feedMap?.[state.currentFilter.label]) {
            state.feedMap[state.currentFilter.label].data = state.feedMap[
              state.currentFilter.label
            ].data.filter((el) => el.hash !== cast.hash);
          }
        }
      });
  },
});

export const HOME_FEED_ACTIONS = homeFeedSlice.actions;

export default homeFeedSlice.reducer;
