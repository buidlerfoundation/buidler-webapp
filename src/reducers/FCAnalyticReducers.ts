import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "api";
import {
  ActivityPeriod,
  IActivityFilter,
  IDataUserEngagement,
  IFCUser,
  IFCUserActivity,
} from "models/FC";

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

interface IFCUserDataEngagementState {
  loading?: boolean;
  data?: IDataUserEngagement;
}

interface IFCUserDataActivityState {
  loading?: boolean;
  data?: IDataUserEngagement;
}

type FCAnalyticReducerState = {
  userMap: { [username: string]: IFCUserState };
  activityMap: { [username: string]: IFCUserActivityState };
  dataEngagementMap: { [username: string]: IFCUserDataEngagementState };
  dataActivityMap: { [username: string]: IFCUserDataActivityState };
  filters: IActivityFilter[];
};

const initialState: FCAnalyticReducerState = {
  userMap: {},
  activityMap: {},
  dataEngagementMap: {},
  dataActivityMap: {},
  filters: [
    { label: "24h", period: "1d" },
    { label: "7d", period: "7d" },
    { label: "14d", period: "14d" },
    { label: "1M", period: "30d" },
    { label: "3M", period: "90d" },
  ],
};

export const getUser = createAsyncThunk(
  "fc-analytic/get-user",
  async (payload: { username: string }) => {
    const res = await api.getFCUser(payload.username);
    return res;
  }
);

export const getActivities = createAsyncThunk(
  "fc-analytic/get-activities",
  async (payload: { username: string; type: ActivityPeriod }) => {
    const res = await api.getUserActivities(payload);
    return res;
  }
);

export const getDataEngagement = createAsyncThunk(
  "fc-analytic/get-data-engagement",
  async (payload: { username: string }) => {
    const res = await api.getUserDataEngagement(payload.username);
    return res;
  }
);

export const getDataActivities = createAsyncThunk(
  "fc-analytic/get-data-activities",
  async (payload: { username: string }) => {
    const res = await api.getUserDataActivities(payload.username);
    return res;
  }
);

const fcAnalyticSlice = createSlice({
  name: "fc-analytic",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getUser.pending, (state, action) => {
        const { username } = action.meta.arg;
        state.userMap[username] = {
          ...state.userMap[username],
          loading: true,
        };
      })
      .addCase(getUser.rejected, (state, action) => {
        const { username } = action.meta.arg;
        state.userMap[username] = {
          loading: false,
        };
      })
      .addCase(getUser.fulfilled, (state, action) => {
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
      }),
});

export const FC_ANALYTIC_ACTIONS = fcAnalyticSlice.actions;

export default fcAnalyticSlice.reducer;
