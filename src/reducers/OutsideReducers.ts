import { createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./UserActions";
import { getDataFromExternalUrl } from "./UserReducers";

interface OutsideState {
  urlType: "main" | "detail";
}

const initialState: OutsideState = {
  urlType: "main",
};

const outsideSlice = createSlice({
  name: "outside",
  initialState,
  reducers: {},
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
