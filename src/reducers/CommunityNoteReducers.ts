import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "api";
import {
  IDashboardLink,
  ILinkMetadata,
  INote,
  IReport,
  IReportCategory,
} from "models/CommunityNote";
import {
  ICommunityNotePath,
  IMetadataUrl,
  IPagingDataOptional,
  IUserInsightTab,
} from "models/FC";
import { IPagingParams } from "models/User";

interface IOpenRateNote {
  note?: INote;
  metadata?: ILinkMetadata;
}

interface communityNoteState {
  reportCategories: IReportCategory[];
  filters: IUserInsightTab<ICommunityNotePath>[];
  feedMap: {
    [key: string]: IPagingDataOptional<INote>;
  };
  dashboardLinkMap: {
    [key: string]: IPagingDataOptional<IDashboardLink>;
  };
  openRateNote?: IOpenRateNote;
  openNoteMetadata?: IMetadataUrl | null;
  openReportMetadata?: IMetadataUrl | null;
  reportsMap: {
    [key: string]: IPagingDataOptional<IReport>;
  };
  dashboardLinkDetailMap: {
    [key: string]: {
      data?: IDashboardLink;
      loading?: boolean;
    };
  };
  myDashboardLink: {
    notes?: IPagingDataOptional<IDashboardLink>;
    ratings?: IPagingDataOptional<IDashboardLink>;
  };
}

const initialState: communityNoteState = {
  reportCategories: [],
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
  feedMap: {},
  dashboardLinkMap: {},
  reportsMap: {},
  dashboardLinkDetailMap: {},
  myDashboardLink: {},
};

export const getMyDashboardLinkNotes = createAsyncThunk(
  "community-note/get-my-dashboard-link-notes",
  async (payload: IPagingParams) => {
    const res = await api.getMyDashboardLinkNotes(payload);
    return res;
  }
);

export const getMyDashboardLinkRatings = createAsyncThunk(
  "community-note/get-my-dashboard-link-rates",
  async (payload: IPagingParams) => {
    const res = await api.getMyDashboardLinkRatings(payload);
    return res;
  }
);

export const getDashboardLinkByUrl = createAsyncThunk(
  "community-note/get-dashboard-link-by-url",
  async (payload: { url: string }) => {
    const res = await api.getDashboardLinkDetail(payload.url);
    return res;
  }
);

export const getReportsByUrl = createAsyncThunk(
  "community-note/get-report-by-url",
  async (payload: { url: string; page: number; limit: number }) => {
    const res = await api.getReportsByUrl(payload.url);
    return res;
  }
);

export const getReportCategories = createAsyncThunk(
  "community-note/get-report-category",
  async () => {
    const res = await api.getReportCategories();
    return res;
  }
);

export const getDashboardLinks = createAsyncThunk(
  "community-note/get-dashboard-links",
  async (payload: { type: string; page: number; limit: number }) => {
    let res;
    if (payload.type === "new") {
      res = await api.getDashboardLinksReportOnly(payload);
    } else {
      const status =
        payload.type === "helpful"
          ? "currently_rated_helpful"
          : "needs_more_ratings";
      res = await api.getDashboardLinks({ status, ...payload });
    }
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
  async (payload: { noteId: string; url: string }) => {
    const res = await api.deleteRating(payload.noteId);
    return res;
  }
);

const updateStatePendingMapKey = (
  state: any,
  keyMap: keyof communityNoteState,
  page: number,
  key: string
) => {
  if (page === 1) {
    state[keyMap][key] = {
      ...(state[keyMap][key] || {}),
      loading: true,
    };
  } else {
    state[keyMap][key] = {
      ...(state[keyMap][key] || {}),
      loadMore: true,
    };
  }
};

const updateStateRejectMapKey = (
  state: any,
  keyMap: keyof communityNoteState,
  key: string
) => {
  state[keyMap][key] = {
    ...(state[keyMap][key] || {}),
    loading: false,
    loadMore: false,
  };
};

const updateStateFulFilled = (
  state: any,
  action: any,
  keyMap: keyof communityNoteState,
  key: string
) => {
  const total = action.payload.metadata?.total || 0;
  const limit = action.meta.arg.limit;
  const totalPage = Math.ceil(total / limit);
  const currentPage = action.meta.arg.page;
  const data = action.payload?.data || [];
  state[keyMap][key] = {
    loading: false,
    loadMore: false,
    currentPage,
    total,
    canMore: totalPage > currentPage,
    data:
      currentPage === 1
        ? data
        : [...(state[keyMap]?.[key]?.data || []), ...data],
  };
};

const communityNoteSlice = createSlice({
  name: "community-note",
  initialState,
  reducers: {
    updateModalRateNote: (
      state,
      action: PayloadAction<IOpenRateNote | undefined>
    ) => {
      state.openRateNote = action.payload;
    },
    updateModalNote: (
      state,
      action: PayloadAction<IMetadataUrl | undefined | null>
    ) => {
      state.openNoteMetadata = action.payload;
    },
    updateModalReport: (
      state,
      action: PayloadAction<IMetadataUrl | undefined | null>
    ) => {
      state.openReportMetadata = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReportCategories.fulfilled, (state, action) => {
        state.reportCategories = action.payload.data || [];
      })
      .addCase(getMyDashboardLinkNotes.pending, (state, action) => {
        const { page } = action.meta.arg;
        updateStatePendingMapKey(state, "myDashboardLink", page, "notes");
      })
      .addCase(getMyDashboardLinkNotes.rejected, (state) => {
        updateStateRejectMapKey(state, "myDashboardLink", "notes");
      })
      .addCase(getMyDashboardLinkNotes.fulfilled, (state, action) => {
        updateStateFulFilled(state, action, "myDashboardLink", "notes");
      })
      .addCase(getMyDashboardLinkRatings.pending, (state, action) => {
        const { page } = action.meta.arg;
        updateStatePendingMapKey(state, "myDashboardLink", page, "ratings");
      })
      .addCase(getMyDashboardLinkRatings.rejected, (state) => {
        updateStateRejectMapKey(state, "myDashboardLink", "ratings");
      })
      .addCase(getMyDashboardLinkRatings.fulfilled, (state, action) => {
        updateStateFulFilled(state, action, "myDashboardLink", "ratings");
      })
      .addCase(getDashboardLinks.pending, (state, action) => {
        const { page, type } = action.meta.arg;
        updateStatePendingMapKey(state, "dashboardLinkMap", page, type);
      })
      .addCase(getDashboardLinks.rejected, (state, action) => {
        const { type } = action.meta.arg;
        updateStateRejectMapKey(state, "dashboardLinkMap", type);
      })
      .addCase(getDashboardLinks.fulfilled, (state, action) => {
        const type = action.meta.arg.type;
        updateStateFulFilled(state, action, "dashboardLinkMap", type);
      })
      .addCase(getReportsByUrl.pending, (state, action) => {
        const { page, url } = action.meta.arg;
        updateStatePendingMapKey(state, "reportsMap", page, url);
      })
      .addCase(getReportsByUrl.rejected, (state, action) => {
        const { url } = action.meta.arg;
        updateStateRejectMapKey(state, "reportsMap", url);
      })
      .addCase(getReportsByUrl.fulfilled, (state, action) => {
        const { url } = action.meta.arg;
        updateStateFulFilled(state, action, "reportsMap", url);
      })
      .addCase(getNotesByUrl.pending, (state, action) => {
        const { page, url } = action.meta.arg;
        updateStatePendingMapKey(state, "feedMap", page, url);
      })
      .addCase(getNotesByUrl.rejected, (state, action) => {
        const { url } = action.meta.arg;
        updateStateRejectMapKey(state, "feedMap", url);
      })
      .addCase(getNotesByUrl.fulfilled, (state, action) => {
        const { url } = action.meta.arg;
        updateStateFulFilled(state, action, "feedMap", url);
      })
      .addCase(ratingNote.fulfilled, (state, action) => {
        if (action.payload.data) {
          const url = action.payload.data.url;
          const feed = { ...state.feedMap[url] };
          const detail = { ...state.dashboardLinkDetailMap[url] };
          if (feed.data) {
            feed.data = feed.data.map((el) => {
              if (el.id === action.meta.arg.noteId) {
                return {
                  ...el,
                  rating: action.payload.data,
                };
              }
              return el;
            });
            state.feedMap[url] = feed;
          }
          if (detail?.data?.note?.id === action.payload.data.note_id) {
            detail.data.note.rating = action.payload.data;
            state.dashboardLinkDetailMap[url] = detail;
          }
          for (const k in state.dashboardLinkMap) {
            if (state.dashboardLinkMap[k]?.data) {
              state.dashboardLinkMap[k].data = state.dashboardLinkMap[
                k
              ].data?.map((link) => {
                if (
                  link.url === url &&
                  link.note &&
                  link.note?.id === action.payload.data?.note_id
                ) {
                  return {
                    ...link,
                    note: {
                      ...link.note,
                      rating: action.payload.data,
                    },
                  };
                }
                return link;
              });
            }
          }
          (
            ["notes", "ratings"] as Array<keyof typeof state.myDashboardLink>
          ).forEach((k) => {
            let data = state.myDashboardLink[k]?.data;
            if (data) {
              data = state.myDashboardLink[k]?.data?.map((link) => {
                if (
                  link.url === url &&
                  link.note &&
                  link.note?.id === action.payload.data?.note_id
                ) {
                  return {
                    ...link,
                    note: {
                      ...link.note,
                      rating: action.payload.data,
                    },
                  };
                }
                return link;
              });
              state.myDashboardLink[k] = {
                ...state.myDashboardLink[k],
                data,
              };
            }
          });
        }
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        const url = action.meta.arg.url;
        const feed = { ...state.feedMap[url] };
        const detail = { ...state.dashboardLinkDetailMap[url] };
        if (action.payload.success) {
          if (feed.data) {
            feed.data = feed.data.map((el) => {
              if (el.id === action.meta.arg.noteId) {
                return {
                  ...el,
                  rating: undefined,
                };
              }
              return el;
            });
            state.feedMap[url] = feed;
          }
          if (detail?.data?.note?.id === action.meta.arg.noteId) {
            detail.data.note.rating = undefined;
            state.dashboardLinkDetailMap[url] = detail;
          }
          for (const k in state.dashboardLinkMap) {
            if (state.dashboardLinkMap[k]?.data) {
              state.dashboardLinkMap[k].data = state.dashboardLinkMap[
                k
              ].data?.map((link) => {
                if (
                  link.url === url &&
                  link.note &&
                  link.note?.id === action.meta.arg.noteId
                ) {
                  return {
                    ...link,
                    note: {
                      ...link.note,
                      rating: undefined,
                    },
                  };
                }
                return link;
              });
            }
          }
          (
            ["notes", "ratings"] as Array<keyof typeof state.myDashboardLink>
          ).forEach((k) => {
            let data = state.myDashboardLink[k]?.data;
            if (data) {
              data = state.myDashboardLink[k]?.data?.map((link) => {
                if (
                  link.url === url &&
                  link.note &&
                  link.note?.id === action.meta.arg.noteId
                ) {
                  return {
                    ...link,
                    note: {
                      ...link.note,
                      rating: undefined,
                    },
                  };
                }
                return link;
              });
              state.myDashboardLink[k] = {
                ...state.myDashboardLink[k],
                data,
              };
            }
          });
        }
      })
      .addCase(submitNote.fulfilled, (state, action) => {
        if (action.payload.data) {
          const url = action.payload.data.url;
          const feed = { ...state.feedMap[url] };
          feed.data = [action.payload.data, ...(feed.data || [])];
          state.feedMap[url] = feed;
          if (state.dashboardLinkMap?.new?.data) {
            state.dashboardLinkMap.new.data =
              state.dashboardLinkMap.new.data.filter(
                (link) => link.url !== url
              );
          }
        }
      })
      .addCase(getDashboardLinkByUrl.pending, (state, action) => {
        const url = action.meta.arg.url;
        state.dashboardLinkDetailMap[url] = {
          ...state.dashboardLinkDetailMap[url],
          loading: true,
        };
      })
      .addCase(getDashboardLinkByUrl.rejected, (state, action) => {
        const url = action.meta.arg.url;
        state.dashboardLinkDetailMap[url] = {
          ...state.dashboardLinkDetailMap[url],
          loading: false,
        };
      })
      .addCase(getDashboardLinkByUrl.fulfilled, (state, action) => {
        const url = action.meta.arg.url;
        state.dashboardLinkDetailMap[url] = {
          data: action.payload.data,
          loading: false,
        };
      });
  },
});

export const COMMUNITY_NOTE_ACTION = communityNoteSlice.actions;

export default communityNoteSlice.reducer;
