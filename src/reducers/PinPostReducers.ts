import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./actions";
import { PostData } from "models/Message";
import { RequestPostList } from "models/Community";
import api from "api";

interface PostReducerData {
  posts: PostData[];
  canMore: boolean;
  count: number;
}

interface PinPostState {
  pinPostData: {
    [key: string]: {
      active?: PostReducerData;
      archived?: PostReducerData;
    };
  };
  loading?: boolean;
  loadMore?: boolean;
}

const initialState: PinPostState = {
  pinPostData: {},
  loading: false,
  loadMore: false,
};

export const getPinPosts = createAsyncThunk(
  "pinPost/list",
  async (payload: RequestPostList) => {
    const res = await api.getListPost(payload);
    if (res.success) {
      return {
        res,
        request: payload,
      };
    }
  }
);

const pinPostSlice = createSlice({
  name: "pinPost",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(logoutAction, () => initialState)
      .addCase(getPinPosts.pending, (state, action) => {
        if (action.meta.arg.before_id) {
          state.loadMore = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(getPinPosts.rejected, (state, action) => {
        if (action.error.name !== "AbortError") {
          state.loadMore = false;
          state.loading = false;
        }
      })
      .addCase(getPinPosts.fulfilled, (state, action) => {
        if (action.payload) {
          const { res, request } = action.payload;
          const currentData =
            state.pinPostData?.[request.channel_id]?.active?.posts || [];
          const data = res.data || [];
          let posts = data;
          if (request.before_id) {
            posts = [...currentData, ...data];
          }
          state.pinPostData[request.channel_id] = {
            active: {
              posts,
              canMore: data.length !== 0,
              count: res.metadata?.total || 0,
            },
          };
        }
        state.loadMore = false;
        state.loading = false;
      }),
});

export const PIN_POST_ACTIONS = pinPostSlice.actions;

export default pinPostSlice.reducer;
