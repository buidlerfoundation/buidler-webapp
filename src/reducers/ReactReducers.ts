import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./UserReducers";
import { ReactReducerData } from "models/Message";
import { getMessages } from "./MessageReducers";

type ReactDataType = { [key: string]: Array<ReactReducerData> };

interface ReactState {
  reactData: ReactDataType;
}

const initialState: ReactState = {
  reactData: {},
};

const reactSlice = createSlice({
  name: "react",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction, () => initialState)
      .addCase(getMessages.fulfilled, (state: ReactState, action) => {
        const currentReact: ReactDataType = {};
        action.payload?.data?.map((dt) => {
          if (dt.reaction_data?.length > 0) {
            currentReact[dt.message_id] = dt.reaction_data.map((react) => ({
              reactName: react.emoji_id,
              count: parseInt(react.reaction_count),
              skin: react.skin,
              isReacted: !!dt.user_reaction.find(
                (uReact) => uReact.emoji_id === react.emoji_id
              ),
            }));
          }
          return dt;
        });
        state.reactData = {
          ...state.reactData,
          ...currentReact,
        };
      });
  },
});

export const REACT_ACTIONS = reactSlice.actions;

export default reactSlice.reducer;
