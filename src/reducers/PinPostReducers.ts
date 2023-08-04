import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { channelChanged } from "./actions";
import { ITopicComment, PostData } from "models/Message";
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
  topicDetail: {
    [key: string]: {
      topic?: PostData | null;
      loading: boolean;
    };
  };
  commentData: {
    [key: string]: {
      comments?: ITopicComment[] | null;
      loading: boolean;
    };
  };
}

const initialState: PinPostState = {
  pinPostData: {},
  topicData: {},
  topicDetail: {},
  commentData: {},
};

export const getReplyTopic = createAsyncThunk(
  "pinPost/get-buidler-reply",
  async (payload: { topicId: string; parentId: string }) => {
    const res = await api.getTopicCommentsById(payload);
    return res;
  }
);

export const getTopicDetail = createAsyncThunk(
  "pinPost/get-buidler-topic",
  async (payload: { topicId: string }) => {
    const res = await api.getTopicById(payload.topicId);
    return res;
  }
);

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
      currentData.unshift(action.payload);
      state.pinPostData[action.payload.root_channel_id] = {
        posts: currentData,
        canMore: state.pinPostData[action.payload.root_channel_id]?.canMore,
        count:
          (state.pinPostData[action.payload.root_channel_id]?.count || 0) + 1,
        loading: false,
        loadMore: false,
      };
    },
    addNewComment: (
      state,
      action: PayloadAction<{ comment: ITopicComment; channelId: string }>
    ) => {
      const { topic_id, parent_id, root_parent_id } = action.payload.comment;
      if (topic_id) {
        if (topic_id === parent_id) {
          if (state.pinPostData?.[action.payload.channelId]) {
            state.pinPostData[action.payload.channelId] = {
              ...state.pinPostData[action.payload.channelId],
              posts: state.pinPostData[action.payload.channelId]?.posts?.map(
                (el) => {
                  if (el.topic_id === topic_id) {
                    return {
                      ...el,
                      total_comments: (el.total_comments || 0) + 1,
                    };
                  }
                  return el;
                }
              ),
            };
          }
          if (state.topicDetail[topic_id]?.topic) {
            const currentTopic = state.topicDetail[topic_id].topic;
            currentTopic?.comments?.push(action.payload.comment);
            state.topicDetail[topic_id] = {
              loading: false,
              topic: currentTopic,
            };
          }
        } else {
          if ((state.commentData[parent_id]?.comments?.length || 0) > 0) {
            state.commentData[parent_id] = {
              loading: false,
              comments: [
                ...(state.commentData[parent_id]?.comments || []),
                action.payload.comment,
              ],
            };
          } else if (root_parent_id) {
            if (
              root_parent_id === topic_id &&
              state.topicDetail[topic_id]?.topic
            ) {
              const currentTopic = state.topicDetail[topic_id].topic;
              if (currentTopic) {
                state.topicDetail[topic_id] = {
                  loading: false,
                  topic: {
                    ...currentTopic,
                    comments: currentTopic?.comments?.map((el) => {
                      if (el.comment_id === parent_id) {
                        return {
                          ...el,
                          total_comments: (el.total_comments || 0) + 1,
                        };
                      }
                      return el;
                    }),
                  },
                };
              }
            } else if (
              (state.commentData[root_parent_id]?.comments?.length || 0) > 0
            ) {
              state.commentData[root_parent_id] = {
                loading: false,
                comments: (
                  state.commentData[root_parent_id]?.comments || []
                ).map((el) => {
                  if (el.comment_id === parent_id) {
                    return {
                      ...el,
                      total_comments: (el.total_comments || 0) + 1,
                    };
                  }
                  return el;
                }),
              };
            }
          }
        }
      }
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(channelChanged, (state) => {
        state.selectedStoryId = null;
        state.selectedTopicId = null;
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
      })
      .addCase(getTopicDetail.pending, (state, action) => {
        const { topicId } = action.meta.arg;
        state.topicDetail[topicId] = {
          loading: true,
          topic: null,
        };
      })
      .addCase(getTopicDetail.rejected, (state, action) => {
        const { topicId } = action.meta.arg;
        state.topicDetail[topicId] = {
          loading: false,
          topic: null,
        };
      })
      .addCase(getTopicDetail.fulfilled, (state, action) => {
        const { topicId } = action.meta.arg;
        state.topicDetail[topicId] = {
          loading: false,
          topic: action.payload.data,
        };
      })
      .addCase(getReplyTopic.pending, (state, action) => {
        const { parentId } = action.meta.arg;
        state.commentData[parentId] = {
          loading: true,
          comments: null,
        };
      })
      .addCase(getReplyTopic.rejected, (state, action) => {
        const { parentId } = action.meta.arg;
        state.commentData[parentId] = {
          loading: false,
          comments: null,
        };
      })
      .addCase(getReplyTopic.fulfilled, (state, action) => {
        const { parentId } = action.meta.arg;
        state.commentData[parentId] = {
          loading: false,
          comments: action.payload.data,
        };
      }),
});

export const PIN_POST_ACTIONS = pinPostSlice.actions;

export default pinPostSlice.reducer;
