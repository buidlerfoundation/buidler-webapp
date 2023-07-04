import { createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./actions";
import { getDataFromExternalUrl } from "./UserActions";

interface OutsideState {
  urlType?: "main" | "detail";
  pluginOpen: boolean;
  loading?: boolean;
}

const initialState: OutsideState = {
  pluginOpen: false,
  loading: false,
};

const outsideSlice = createSlice({
  name: "outside",
  initialState,
  reducers: {
    toggle: (state: OutsideState) => {
      state.pluginOpen = !state.pluginOpen;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(logoutAction, () => initialState)
      .addCase(getDataFromExternalUrl.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDataFromExternalUrl.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getDataFromExternalUrl.fulfilled, (state, action) => {
        state.loading = false;
        const { url } = action.meta.arg;
        if (url) {
          const uri = new URL(url);
          state.urlType = uri.pathname === "/" ? "main" : "detail";
        }
      }),
});

export const OUTSIDE_ACTIONS = outsideSlice.actions;

export default outsideSlice.reducer;
