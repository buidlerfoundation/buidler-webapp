import { createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./UserActions";
import { getDataFromExternalUrl } from "./UserReducers";

interface OutsideState {
  urlType?: "main" | "detail";
  pluginOpen: boolean;
}

const initialState: OutsideState = {
  pluginOpen: false,
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
      .addCase(
        getDataFromExternalUrl.fulfilled,
        (state: OutsideState, action) => {
          const { url } = action.meta.arg;
          if (url) {
            const uri = new URL(url);
            state.urlType = uri.pathname === "/" ? "main" : "detail";
          }
        }
      ),
});

export const OUTSIDE_ACTIONS = outsideSlice.actions;

export default outsideSlice.reducer;
