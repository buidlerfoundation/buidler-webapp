import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "api";
import { INote } from "models/CommunityNote";
import { ICommunityNotePath, IPagingData, IUserInsightTab } from "models/FC";

interface communityNoteState {
  filters: IUserInsightTab<ICommunityNotePath>[];
  feed: IPagingData<INote>;
}

const initialState: communityNoteState = {
  filters: [
    {
      label: "Rated helpful",
      path: "/community-notes",
    },
    {
      label: "New",
      path: "/community-notes/new",
    },
  ],
  feed: {},
};

export const getNotesByUrl = createAsyncThunk(
  "community-note/get-by-url",
  async (payload: { url: string; page: number; limit: number }) => {
    const res = await api.getListNotesByUrl(payload);
    return res;
  }
);

export const ratingNote = createAsyncThunk(
  "community-note/rating-note",
  async (payload: { noteId: string; body: any }) => {
    const res = await api.submitRating(payload.noteId, payload.body);
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
    builder.addCase(getNotesByUrl.pending, (state, action) => {
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
      });
  },
});

export const COMMUNITY_NOTE_ACTION = communityNoteSlice.actions;

export default communityNoteSlice.reducer;
