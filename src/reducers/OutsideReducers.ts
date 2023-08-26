import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getDataFromExternalUrl } from "./UserActions";

interface OutsideState {
  urlType?: "main" | "detail";
  pluginOpen: boolean;
  loading?: boolean;
  autoOff?: boolean;
  externalUrl?: string;
  extensionId?: string;
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
    updateExtensionId: (state, action: PayloadAction<string>) => {
      state.extensionId = action.payload;
    },
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
      .addCase(getDataFromExternalUrl.pending, (state, action) => {
        const { url } = action.meta.arg;
        if (url) {
          const uri = new URL(url);
          state.urlType =
            uri.pathname === "/" && !uri.search && !uri.hash
              ? "main"
              : "detail";
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
