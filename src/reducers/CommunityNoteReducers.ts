import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "api";
import { INote, IReport } from "models/CommunityNote";
import {
  ICommunityNotePath,
  IPagingDataOptional,
  IUserInsightTab,
} from "models/FC";

interface communityNoteState {
  filters: IUserInsightTab<ICommunityNotePath>[];
  feed: IPagingDataOptional<INote>;
  reportMap: {
    [key: string]: IPagingDataOptional<IReport>;
  };
}

const initialState: communityNoteState = {
  filters: [
    {
      label: "Rated helpful",
      path: "/community-notes",
    },
    {
      label: "Need more ratings",
      path: "/community-notes/nmr",
    },
    {
      label: "New Report",
      path: "/community-notes/new",
    },
  ],
  feed: {},
  reportMap: {},
};

export const getReports = createAsyncThunk(
  "community-note/get-report",
  async (payload: { type: string; page: number; limit: number }) => {
    const res = await api.getReports();
    return res;
  }
);

export const getNotesByUrl = createAsyncThunk(
  "community-note/get-by-url",
  async (payload: { url: string; page: number; limit: number }) => {
    const res = await api.getListNotesByUrl(payload);
    return res;
  }
);

export const submitNote = createAsyncThunk(
  "community-note/submit",
  async (payload: any) => {
    const res = await api.submitNote(payload);
    return res;
  }
);

export const ratingNote = createAsyncThunk(
  "community-note/rating-note",
  async (payload: { noteId: string; body: any; isEdit: boolean }) => {
    const res = payload.isEdit
      ? await api.updateRating(payload.noteId, payload.body)
      : await api.submitRating(payload.noteId, payload.body);
    return res;
  }
);

export const deleteRating = createAsyncThunk(
  "community-note/delete-rating",
  async (payload: { noteId: string }) => {
    const res = await api.deleteRating(payload.noteId);
    return res;
  }
);

const communityNoteSlice = createSlice({
  name: "community-note",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReports.pending, (state, action) => {
        const { page, type } = action.meta.arg;
        if (page === 1) {
          state.reportMap[type] = {
            ...(state.reportMap[type] || {}),
            loading: true,
          };
        } else {
          state.reportMap[type] = {
            ...(state.reportMap[type] || {}),
            loadMore: true,
          };
        }
      })
      .addCase(getReports.fulfilled, (state, action) => {
        const total = action.payload.metadata?.total || 0;
        const limit = action.meta.arg.limit;
        const type = action.meta.arg.type;
        const totalPage = Math.ceil(total / limit);
        const currentPage = action.meta.arg.page;
        const data = action.payload?.data || [];
        state.reportMap[type] = {
          loading: false,
          loadMore: false,
          currentPage,
          total,
          canMore: totalPage > currentPage,
          data:
            currentPage === 1
              ? data
              : [...(state.reportMap?.[type]?.data || []), ...data],
        };
      })
      .addCase(getNotesByUrl.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.feed.loading = true;
        } else {
          state.feed.loadMore = true;
        }
      });
    builder.addCase(getNotesByUrl.rejected, (state, action) => {
      state.feed.loading = false;
      state.feed.loadMore = false;
    });
    builder
      .addCase(getNotesByUrl.fulfilled, (state, action) => {
        const total = action.payload.metadata?.total || 0;
        const limit = action.meta.arg.limit;
        const totalPage = Math.ceil(total / limit);
        const currentPage = action.meta.arg.page;
        const data = action.payload?.data || [];
        state.feed.data =
          currentPage === 1 ? data : [...(state.feed.data || []), ...data];
        state.feed.loadMore = false;
        state.feed.loading = false;
        state.feed.total = total;
        state.feed.canMore = totalPage > currentPage;
        state.feed.currentPage = currentPage;
      })
      .addCase(ratingNote.fulfilled, (state, action) => {
        if (action.payload.data && state.feed.data) {
          state.feed.data = state.feed.data.map((el) => {
            if (el.id === action.meta.arg.noteId) {
              return {
                ...el,
                rating: action.payload.data,
              };
            }
            return el;
          });
        }
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        if (action.payload.success && state.feed.data) {
          state.feed.data = state.feed.data.map((el) => {
            if (el.id === action.meta.arg.noteId) {
              return {
                ...el,
                rating: undefined,
              };
            }
            return el;
          });
        }
      })
      .addCase(submitNote.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.feed.data = [action.payload.data, ...(state.feed.data || [])];
        }
      });
  },
});

export const COMMUNITY_NOTE_ACTION = communityNoteSlice.actions;

export default communityNoteSlice.reducer;
