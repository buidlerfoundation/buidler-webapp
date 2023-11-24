import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICast, IFCFilterType, IPagingData } from "models/FC";
import api from "api";

interface HomeFeedState {
  feedMap: {
    [key: string]: IPagingData<ICast>;
  };
  replyCast?: ICast;
  castDetail: {
    data?: ICast;
    loading: boolean;
  };
  castRepliesMap: {
    [key: string]: IPagingData<ICast>;
  };
  openNewCast: boolean;
  filters: IFCFilterType[];
  currentFilter: IFCFilterType;
  explore: IPagingData<ICast>;
}

const initialState: HomeFeedState = {
  feedMap: {},
  castDetail: {
    loading: false,
  },
  castRepliesMap: {},
  openNewCast: false,
  filters: [
    {
      label: "trending",
      path: "/home",
      id: "1",
      value: "trending",
      title: "Hacker News on Farcaster",
    },
    {
      label: "active",
      id: "2",
      path: "/active",
      value: "most-commented",
      title: "Most active links on Farcaster",
    },
    {
      label: "top",
      id: "3",
      path: "/top",
      value: "most-liked",
      title: "Top links of the week on Farcaster",
    },
  ],
  currentFilter: {
    label: "trending",
    path: "/",
    id: "1",
    value: "trending",
    title: "Trending links on Farcaster",
  },
  explore: {
    data: [],
  },
};

export const getFeedByUrl = createAsyncThunk(
  "home-feed/get-by-url",
  async (payload: { text: string; page: number; limit: number }) => {
    const res = await api.listCasts(payload);
    return res;
  }
);

export const getCastDetail = createAsyncThunk(
  "home-feed/get-by-hash",
  async (payload: {
    hash: string;
    page: number;
    limit: number;
    cast_author_fid?: string;
  }) => {
    const res = await api.getCastDetail(payload);
    return res;
  }
);

export const getResultCastByHash = createAsyncThunk(
  "home-feed/get-result-hash",
  async (payload: {
    hash: string;
    page: number;
    limit: number;
    cast_author_fid?: string;
    parent_hash?: string;
    query_url?: string;
  }) => {
    const res = await api.getCastDetail(payload);
    return res;
  }
);

export const getCastReplies = createAsyncThunk(
  "home-feed/get-replies",
  async (payload: { hash: string; page: number; limit: number }) => {
    const res = await api.getCastDetail(payload);
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
        const total = action.payload?.data?.replies?.count || 0;
        const limit = action.meta.arg.limit;
        const totalPage = Math.ceil(total / limit);

        state.castDetail = {
          loading: false,
          data: action.payload.data,
        };
        state.castRepliesMap = {
          [action.meta.arg.hash]: {
            loading: false,
            loadMore: false,
            data: action.payload.data?.replies?.casts || [],
            currentPage: 1,
            canMore: totalPage > 1,
            total,
          },
        };
        state.filters.forEach((filter) => {
          if (state.feedMap?.[filter.value]) {
            state.feedMap[filter.value].data = state.feedMap[
              filter.value
            ].data.map((el) => {
              if (el.hash === action.meta.arg.hash) {
                return action.payload.data || el;
              }
              return el;
            });
          }
        });
      })
      .addCase(getResultCastByHash.fulfilled, (state, action) => {
        const { parent_hash } = action.meta.arg;
        if (parent_hash && action.payload.data) {
          if (
            state.castDetail.data &&
            state.castDetail.data.hash === parent_hash
          ) {
            state.castDetail.data.replies = {
              count: (state.castDetail.data.replies?.count || 0) + 1,
              casts: [
                action.payload.data,
                ...(state.castDetail.data.replies?.casts || []),
              ],
            };
          }
          if (state.castRepliesMap?.[parent_hash]) {
            state.castRepliesMap[parent_hash] = {
              ...state.castRepliesMap[parent_hash],
              total: (state.castRepliesMap[parent_hash].total || 0) + 1,
              data: [
                action.payload.data,
                ...(state.castRepliesMap[parent_hash].data || []),
              ],
            };
          }
        }
      })
      .addCase(getCastReplies.pending, (state, action) => {
        const { page, hash } = action.meta.arg;
        if (page === 1) {
          state.castRepliesMap[hash] = {
            ...(state.castRepliesMap?.[hash] || {}),
            loading: true,
          };
        } else {
          state.castRepliesMap[hash] = {
            ...(state.castRepliesMap?.[hash] || {}),
            loadMore: true,
          };
        }
      })
      .addCase(getCastReplies.rejected, (state, action) => {
        const hash = action.meta.arg.hash;
        state.castRepliesMap[hash] = {
          ...(state.castRepliesMap?.[hash] || {}),
          loading: false,
          loadMore: false,
        };
      })
      .addCase(getCastReplies.fulfilled, (state, action) => {
        const hash = action.meta.arg.hash;
        const total = action.payload?.data?.replies?.count || 0;
        const limit = action.meta.arg.limit;
        const totalPage = Math.ceil(total / limit);
        const currentPage = action.meta.arg.page;
        const data = action.payload?.data?.replies?.casts || [];
        state.castRepliesMap[hash] = {
          loading: false,
          loadMore: false,
          currentPage,
          total: totalPage,
          data:
            currentPage === 1
              ? data
              : [...(state.castRepliesMap[hash]?.data || []), ...data],
          canMore: totalPage > currentPage,
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
          state.filters.forEach((filter) => {
            if (state.feedMap?.[filter.value]) {
              state.feedMap[filter.value].data = state.feedMap[
                filter.value
              ].data.map((el) => {
                if (el.hash === action.meta.arg.hash) {
                  return action.payload.data || el;
                }
                return el;
              });
            }
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
          state.filters.forEach((filter) => {
            if (state.feedMap?.[filter.value]) {
              state.feedMap[filter.value].data = state.feedMap[
                filter.value
              ].data.filter((el) => el.hash !== cast.hash);
            }
          });
        }
      })
      .addCase(getFeedByUrl.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.explore = {
            loading: true,
            data: [],
          };
        } else {
          state.explore = {
            ...state.explore,
            loadMore: true,
          };
        }
      })
      .addCase(getFeedByUrl.rejected, (state) => {
        state.explore = {
          ...state.explore,
          loadMore: false,
          loading: false,
        };
      })
      .addCase(getFeedByUrl.fulfilled, (state, action) => {
        const total = action.payload.metadata?.total || 0;
        const limit = action.meta.arg.limit;
        const totalPage = Math.ceil(total / limit);
        const currentPage = action.meta.arg.page;
        const data = action.payload?.data || [];
        state.explore = {
          data: currentPage === 1 ? data : [...state.explore.data, ...data],
          loadMore: false,
          loading: false,
          total,
          canMore: totalPage > currentPage,
          currentPage,
        };
      });
  },
});

export const HOME_FEED_ACTIONS = homeFeedSlice.actions;

export default homeFeedSlice.reducer;
