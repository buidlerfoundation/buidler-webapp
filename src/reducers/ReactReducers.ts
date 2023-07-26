import {
  PayloadAction,
  createAction,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { logoutAction } from "./actions";
import { ReactReducerData } from "models/Message";
import { getMessages } from "./MessageReducers";
import api from "api";

type ReactDataType = { [key: string]: ReactReducerData[] };

type ReactActionPayload = {
  id: string;
  reactName: string;
  userId?: string;
  mine?: boolean;
};

interface ReactState {
  reactData: ReactDataType;
}

const initialState: ReactState = {
  reactData: {},
};

export const handleAddReact = (payload: ReactActionPayload) => {
  const { id, reactName } = payload;
  api.addReaction(id, { emoji_id: reactName, skin: 1 });
};

export const handleRemoveReact = (payload: ReactActionPayload) => {
  const { id, reactName } = payload;
  api.removeReaction(id, { emoji_id: reactName });
};

const reactSlice = createSlice({
  name: "react",
  initialState,
  reducers: {
    addReact: (
      state: ReactState,
      action: PayloadAction<ReactActionPayload>
    ) => {
      const { id, reactName, mine } = action.payload;
      const currentReact = state.reactData[id] || [];
      const currentIndex = currentReact.findIndex(
        (react) => react.reactName === reactName
      );
      if (currentIndex >= 0) {
        currentReact[currentIndex] = {
          reactName,
          count: currentReact[currentIndex].count + 1,
          skin: 1,
          isReacted: currentReact[currentIndex].isReacted || mine,
        };
      } else {
        currentReact.push({
          reactName,
          count: 1,
          skin: 1,
          isReacted: mine,
        });
      }
      state.reactData = {
        ...state.reactData,
        [id]: [...currentReact],
      };
    },
    removeReact: (
      state: ReactState,
      action: PayloadAction<ReactActionPayload>
    ) => {
      const { id, reactName, mine } = action.payload;
      const currentReact = state.reactData[id] || [];
      const currentIndex = currentReact.findIndex(
        (react) => react.reactName === reactName
      );
      if (currentIndex >= 0) {
        currentReact[currentIndex] = {
          reactName,
          count: currentReact[currentIndex].count - 1,
          skin: 1,
          isReacted: mine ? false : currentReact[currentIndex].isReacted,
        };
      }
      state.reactData = {
        ...state.reactData,
        [id]: [...currentReact].filter((react) => react.count > 0),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction, () => initialState)
      .addCase(getMessages.fulfilled, (state: ReactState, action) => {
        const currentReact: ReactDataType = {};
        action.payload?.data?.map((dt) => {
          currentReact[dt.message_id] = Object.keys(dt.reaction_data || {}).map(
            (key) => ({
              reactName: key,
              count: dt.reaction_data?.[key] || 0,
              skin: 1,
              // isReacted: !!dt.user_reaction.find(
              //   (uReact) => uReact.emoji_id === react.emoji_id
              // ),
            })
          );
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
