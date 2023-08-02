import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { channelChanged } from "./actions";
import { PostData } from "models/Message";
import { IHNStory, RequestPostList } from "models/Community";
import api from "api";

interface PostReducerData {
  posts: PostData[];
  canMore: boolean;
  count: number;
  loading?: boolean;
  loadMore?: boolean;
}

interface PinPostState {
  pinPostData: {
    [key: string]: PostReducerData;
  };
  topicData: {
    [key: string]: {
      stories: IHNStory[];
      page: number;
      total: number;
      totalPage: number;
      loading?: boolean;
      loadMore?: boolean;
    };
  };
  selectedStoryId?: string | null;
  selectedTopicId?: string | null;
}

const initialState: PinPostState = {
  pinPostData: {},
  topicData: {},
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

export const getStories = createAsyncThunk(
  "pinPost/topic",
  async (payload: { url: string; page?: number }) => {
    const res = await api.getStories(payload);
    if (res.success) {
      return res;
    }
  }
);

const pinPostSlice = createSlice({
  name: "pinPost",
  initialState,
  reducers: {
    updateSelectedStoryId: (state, action: PayloadAction<string | null>) => {
      state.selectedStoryId = action.payload;
    },
    updateSelectedTopicId: (state, action: PayloadAction<string | null>) => {
      state.selectedTopicId = action.payload;
    },
    addNewTopic: (state, action: PayloadAction<PostData>) => {
      const currentData =
        state.pinPostData?.[action.payload.root_channel_id]?.posts || [];
      currentData.push(action.payload);
      state.pinPostData[action.payload.root_channel_id] = {
        posts: currentData,
        canMore: state.pinPostData[action.payload.root_channel_id]?.canMore,
        count:
          (state.pinPostData[action.payload.root_channel_id]?.count || 0) + 1,
        loading: false,
        loadMore: false,
      };
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(channelChanged, (state) => {
        state.selectedStoryId = null;
      })
      .addCase(getPinPosts.pending, (state, action) => {
        const { channel_id, before_id } = action.meta.arg;
        state.pinPostData = {
          ...state.pinPostData,
          [channel_id]: {
            ...(state.pinPostData[channel_id] || {}),
            loading: !before_id,
            loadMore: !!before_id,
          },
        };
      })
      .addCase(getPinPosts.rejected, (state, action) => {
        if (action.error.name !== "AbortError") {
          const { channel_id } = action.meta.arg;
          state.pinPostData = {
            ...state.pinPostData,
            [channel_id]: {
              ...(state.pinPostData[channel_id] || {}),
              loading: false,
              loadMore: false,
            },
          };
        }
      })
      .addCase(getPinPosts.fulfilled, (state, action) => {
        if (action.payload) {
          const { res, request } = action.payload;
          const currentData =
            state.pinPostData?.[request.channel_id]?.posts || [];
          const data = res.data || [];
          let posts = data;
          if (request.before_id) {
            posts = [...currentData, ...data];
          }
          state.pinPostData[request.channel_id] = {
            posts,
            canMore: data.length !== 0,
            count: res.metadata?.total || 0,
            loading: false,
            loadMore: false,
          };
        }
      })
      .addCase(getStories.pending, (state, action) => {
        const { url, page = 1 } = action.meta.arg;
        state.topicData = {
          ...state.topicData,
          [url]: {
            ...(state.topicData[url] || {}),
            loading: page === 1,
            loadMore: page > 1,
          },
        };
      })
      .addCase(getStories.rejected, (state, action) => {
        const { url } = action.meta.arg;
        state.topicData = {
          ...state.topicData,
          [url]: {
            ...(state.topicData[url] || {}),
            loading: false,
            loadMore: false,
          },
        };
      })
      .addCase(getStories.fulfilled, (state, action) => {
        if (action.payload) {
          const { url } = action.meta.arg;
          const currentPage = action.payload?.metadata?.current_page || 1;
          const currentStories = state.topicData?.[url]?.stories || [];
          const stories = action.payload.data || [];
          const data =
            currentPage === 1 ? stories : [...currentStories, ...stories];
          state.topicData = {
            ...state.topicData,
            [url]: {
              page: currentPage || 1,
              total: action.payload.metadata?.total || data?.length || 0,
              totalPage: action.payload.metadata?.total_pages || 0,
              stories: data,
              loading: false,
              loadMore: false,
            },
          };
        }
      }),
});

export const PIN_POST_ACTIONS = pinPostSlice.actions;

export default pinPostSlice.reducer;
