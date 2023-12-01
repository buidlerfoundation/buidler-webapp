import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ActivityPeriod,
  IActiveBadgeCheck,
  IActivityFilter,
  IDataUserEngagement,
  IFCUser,
  IFCUserActivity,
  IPagingData,
  IUserInsightTab,
  IUserTabPath,
} from "models/FC";
import api from "api";

export const getUserProfile = createAsyncThunk(
  "insights/get-user",
  async (payload: { username: string }) => {
    const resFid = await api.getFCUserByUserName(payload.username);
    const res = await api.getFCUser(resFid.data?.fid || "");
    return res;
  }
);

export const getDataActiveBadgeCheck = createAsyncThunk(
  "insights/get-active-badge-check",
  async (payload: { username: string }) => {
    const res = await api.getActiveBadgeCheck(payload.username);
    return res;
  }
);

export const getActivities = createAsyncThunk(
  "insights/get-activities",
  async (payload: { username: string; type: ActivityPeriod }) => {
    const res = await api.getUserActivities(payload);
    return res;
  }
);

export const getDataEngagement = createAsyncThunk(
  "insights/get-data-engagement",
  async (payload: { username: string }) => {
    const res = await api.getUserDataEngagement(payload.username);
    return res;
  }
);

export const getDataActivities = createAsyncThunk(
  "insights/get-data-activities",
  async (payload: { username: string }) => {
    const res = await api.getUserDataActivities(payload.username);
    return res;
  }
);

export const getDataFollowUsers = createAsyncThunk(
  "insights/get-data-follow",
  async (payload: {
    username: string;
    page: number;
    limit: number;
    path: IUserTabPath;
  }) => {
    let res: any;
    switch (payload.path) {
      case "/non-follower":
        res = await api.getNonFollowerUsers(payload);
        break;
      case "/follower":
        res = await api.getFollowerUsers(payload);
        break;
      case "/following":
        res = await api.getFollowingUsers(payload);
        break;
      default:
        break;
    }
    return res;
  }
);

export const getTopInteractions = createAsyncThunk(
  "insights/get-top-interactions",
  async (payload: { username: string; page: number; limit: number }) => {
    const res = await api.getTopInteractions(payload);
    return res;
  }
);

export const followUser = createAsyncThunk(
  "insights/follow",
  async (payload: { username: string; fid: string }) => {
    const res = await api.followUser(payload.fid);
    return res;
  }
);

export const unfollowUser = createAsyncThunk(
  "insights/unfollow",
  async (payload: { username: string; fid: string }) => {
    const res = await api.unfollowUser(payload.fid);
    return res;
  }
);

interface IFCUserState {
  loading?: boolean;
  data?: IFCUser;
}

interface IFCUserActivityState {
  [key: string]: {
    loading?: boolean;
    data?: IFCUserActivity;
  };
}

interface IFollowUserState {
  [key: string]: IPagingData<IFCUser>;
}

interface IFCUserDataEngagementState {
  loading?: boolean;
  data?: IDataUserEngagement;
}

interface IFCUserDataActivityState {
  loading?: boolean;
  data?: IDataUserEngagement;
}

interface IFCActiveBadgeCheckState {
  loading?: boolean;
  data?: IActiveBadgeCheck;
}

interface InsightsState {
  userMap: { [username: string]: IFCUserState };
  activeBadgeCheckMap: { [username: string]: IFCActiveBadgeCheckState };
  activityMap: { [username: string]: IFCUserActivityState };
  dataEngagementMap: { [username: string]: IFCUserDataEngagementState };
  dataActivityMap: { [username: string]: IFCUserDataActivityState };
  followUserMap: { [username: string]: IFollowUserState };
  dataInteractionMap: { [username: string]: IPagingData<IFCUser> };
  filters: IActivityFilter[];
  userTabs: IUserInsightTab[];
  period: ActivityPeriod;
}

const initialState: InsightsState = {
  userMap: {},
  activityMap: {},
  dataEngagementMap: {},
  dataActivityMap: {},
  followUserMap: {},
  dataInteractionMap: {},
  activeBadgeCheckMap: {},
  filters: [
    { label: "24h", period: "1d" },
    { label: "7d", period: "7d" },
    { label: "14d", period: "14d" },
    { label: "1M", period: "30d" },
    { label: "3M", period: "90d" },
  ],
  userTabs: [
    { path: "/follower", label: "Followers" },
    { path: "/following", label: "Following" },
    { path: "/non-follower", label: "Non Followers" },
  ],
  period: "7d",
};

const insightsSlice = createSlice({
  name: "insights",
  initialState,
  reducers: {
    updatePeriod: (state, action: PayloadAction<ActivityPeriod>) => {
      state.period = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(getUserProfile.pending, (state, action) => {
        const { username } = action.meta.arg;
        state.userMap[username] = {
          ...state.userMap[username],
          loading: true,
        };
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        const { username } = action.meta.arg;
        state.userMap[username] = {
          loading: false,
        };
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        const { username } = action.meta.arg;
        state.userMap[username] = {
          loading: false,
          data: action.payload.data,
        };
      })
      .addCase(getActivities.pending, (state, action) => {
        const { username, type } = action.meta.arg;
        state.activityMap[username] = {
          ...state.activityMap[username],
          [type]: {
            ...(state.activityMap[username]?.[type] || {}),
            loading: true,
          },
        };
      })
      .addCase(getActivities.rejected, (state, action) => {
        const { username, type } = action.meta.arg;
        state.activityMap[username] = {
          ...state.activityMap[username],
          [type]: {
            loading: false,
          },
        };
      })
      .addCase(getActivities.fulfilled, (state, action) => {
        const { username, type } = action.meta.arg;
        state.activityMap[username] = {
          ...state.activityMap[username],
          [type]: {
            loading: false,
            data: action.payload.data,
          },
        };
      })
      .addCase(getDataEngagement.pending, (state, action) => {
        const { username } = action.meta.arg;
        state.dataEngagementMap[username] = {
          ...state.dataEngagementMap[username],
          loading: true,
        };
      })
      .addCase(getDataEngagement.rejected, (state, action) => {
        const { username } = action.meta.arg;
        state.dataEngagementMap[username] = {
          loading: false,
        };
      })
      .addCase(getDataEngagement.fulfilled, (state, action) => {
        const { username } = action.meta.arg;
        state.dataEngagementMap[username] = {
          loading: false,
          data: action.payload.data,
        };
      })
      .addCase(getDataActivities.pending, (state, action) => {
        const { username } = action.meta.arg;
        state.dataActivityMap[username] = {
          ...state.dataActivityMap[username],
          loading: true,
        };
      })
      .addCase(getDataActivities.rejected, (state, action) => {
        const { username } = action.meta.arg;
        state.dataActivityMap[username] = {
          loading: false,
        };
      })
      .addCase(getDataActivities.fulfilled, (state, action) => {
        const { username } = action.meta.arg;
        state.dataActivityMap[username] = {
          data: action.payload.data,
          loading: false,
        };
      })
      .addCase(getDataFollowUsers.pending, (state, action) => {
        const { page, username, path } = action.meta.arg;
        const data = state.followUserMap?.[username]?.[path] || {};
        if (page === 1) {
          data.loading = true;
        } else {
          data.loadMore = true;
        }
        state.followUserMap[username] = {
          ...(state.followUserMap?.[username] || {}),
          [path]: data,
        };
      })
      .addCase(getDataFollowUsers.rejected, (state, action) => {
        const { username, path } = action.meta.arg;
        state.followUserMap[username][path] = {
          ...(state.followUserMap[username][path] || {}),
          loading: false,
          loadMore: false,
        };
      })
      .addCase(getDataFollowUsers.fulfilled, (state, action) => {
        const total = action.payload.metadata?.total || 0;
        const limit = action.meta.arg.limit;
        const path = action.meta.arg.path;
        const username = action.meta.arg.username;
        const totalPage = Math.ceil(total / limit);
        const currentPage = action.meta.arg.page;
        const data = action.payload?.data || [];
        state.followUserMap[username][path] = {
          loading: false,
          loadMore: false,
          currentPage,
          total,
          canMore: totalPage > currentPage,
          data:
            currentPage === 1
              ? data
              : [
                  ...(state.followUserMap?.[username]?.[path]?.data || []),
                  ...data,
                ],
        };
      })
      .addCase(getTopInteractions.pending, (state, action) => {
        const { page, username } = action.meta.arg;
        const data = state.dataInteractionMap[username] || {};
        if (page === 1) {
          data.loading = true;
        } else {
          data.loadMore = true;
        }
        state.dataInteractionMap[username] = data;
      })
      .addCase(getTopInteractions.rejected, (state, action) => {
        const { username } = action.meta.arg;
        state.dataInteractionMap[username] = {
          ...(state.dataInteractionMap[username] || {}),
          loading: false,
          loadMore: false,
        };
      })
      .addCase(getTopInteractions.fulfilled, (state, action) => {
        const total = action.payload.metadata?.total || 0;
        const limit = action.meta.arg.limit;
        const username = action.meta.arg.username;
        const totalPage = Math.ceil(total / limit);
        const currentPage = action.meta.arg.page;
        const data = action.payload?.data || [];
        state.dataInteractionMap[username] = {
          loading: false,
          loadMore: false,
          currentPage,
          total,
          canMore: totalPage > currentPage,
          data:
            currentPage === 1
              ? data
              : [
                  ...(state.dataInteractionMap?.[username]?.data || []),
                  ...data,
                ],
        };
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { username } = action.meta.arg;
        const userData = state.userMap?.[username]?.data;
        if (userData) {
          userData.is_followed = true;
          state.userMap[username].data = userData;
        }
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { username } = action.meta.arg;
        const userData = state.userMap?.[username]?.data;
        if (userData) {
          userData.is_followed = false;
          state.userMap[username].data = userData;
        }
      })
      .addCase(getDataActiveBadgeCheck.pending, (state, action) => {
        const { username } = action.meta.arg;
        state.activeBadgeCheckMap[username] = {
          ...state.activeBadgeCheckMap[username],
          loading: true,
        };
      })
      .addCase(getDataActiveBadgeCheck.rejected, (state, action) => {
        const { username } = action.meta.arg;
        state.activeBadgeCheckMap[username] = {
          loading: false,
        };
      })
      .addCase(getDataActiveBadgeCheck.fulfilled, (state, action) => {
        const { username } = action.meta.arg;
        state.activeBadgeCheckMap[username] = {
          data: action.payload.data,
          loading: false,
        };
      }),
});

export const INSIGHTS_ACTIONS = insightsSlice.actions;

export default insightsSlice.reducer;
