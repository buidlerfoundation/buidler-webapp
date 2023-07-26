import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./actions";
import { getDataFromExternalUrl } from "./UserActions";

interface OutsideState {
  urlType?: "main" | "detail";
  pluginOpen: boolean;
  loading?: boolean;
  autoOff?: boolean;
  externalUrl?: string;
}

const initialState: OutsideState = {
  pluginOpen: false,
  loading: false,
  autoOff: false,
};

const outsideSlice = createSlice({
  name: "outside",
  initialState,
  reducers: {
    updateAutoOff: (state, action: PayloadAction<boolean>) => {
      state.autoOff = action.payload;
    },
    toggle: (state: OutsideState) => {
      state.pluginOpen = !state.pluginOpen;
    },
    openAtFirst: (state: OutsideState) => {
      state.pluginOpen = true;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(logoutAction, () => initialState)
      .addCase(getDataFromExternalUrl.pending, (state, action) => {
        const { url } = action.meta.arg;
        if (url) {
          const uri = new URL(url);
          state.urlType = uri.pathname === "/" ? "main" : "detail";
          state.externalUrl = url;
        }
        state.loading = true;
      })
      .addCase(getDataFromExternalUrl.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getDataFromExternalUrl.fulfilled, (state) => {
        state.loading = false;
      }),
});

export const OUTSIDE_ACTIONS = outsideSlice.actions;

export default outsideSlice.reducer;
