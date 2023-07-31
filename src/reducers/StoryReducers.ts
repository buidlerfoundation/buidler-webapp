import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IHNComment } from "models/Community";
import api from "api";

interface StoryCommentData {
  comments: IHNComment[];
  total: number;
  totalPage: number;
  page: number;
  loading: boolean;
  loadMore: boolean;
}

interface StoryState {
  storyCommentData: {
    [key: string]: StoryCommentData;
  };
}

const initialState: StoryState = {
  storyCommentData: {},
};

export const getStoryComments = createAsyncThunk(
  "story/comment-list",
  async (payload: { id: string; page?: number }) => {
    const res = await api.getCommentFromStory(payload);
    if (res.success) {
      return res;
    }
  }
);

const storySlice = createSlice({
  name: "story",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getStoryComments.pending, (state, action) => {
        const { id, page = 1 } = action.meta.arg;
        state.storyCommentData = {
          ...state.storyCommentData,
          [id]: {
            ...(state.storyCommentData[id] || {}),
            loading: page === 1,
            loadMore: page > 1,
          },
        };
      })
      .addCase(getStoryComments.rejected, (state, action) => {
        const { id } = action.meta.arg;
        state.storyCommentData = {
          ...state.storyCommentData,
          [id]: {
            ...(state.storyCommentData[id] || {}),
            loading: false,
            loadMore: false,
          },
        };
      })
      .addCase(getStoryComments.fulfilled, (state, action) => {
        if (action.payload) {
          const { id, page } = action.meta.arg;
          const currentComments = state.storyCommentData?.[id]?.comments || [];
          const comments = action.payload.data || [];
          const data = !page ? comments : [...currentComments, ...comments];
          state.storyCommentData = {
            ...state.storyCommentData,
            [id]: {
              page: page || 1,
              total: action.payload.metadata?.total || 0,
              totalPage: action.payload.metadata?.total_pages || 0,
              comments: data,
              loading: false,
              loadMore: false,
            },
          };
        }
      }),
});

export const STORY_ACTIONS = storySlice.actions;

export default storySlice.reducer;
