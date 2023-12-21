import { createSlice } from "@reduxjs/toolkit";
import { ICommunityNotePath, IUserInsightTab } from "models/FC";

interface communityNoteState {
  filters: IUserInsightTab<ICommunityNotePath>[];
}

const initialState: communityNoteState = {
  filters: [
    {
      label: "Rated helpful",
      path: "/community-notes",
    },
    {
      label: "New",
      path: "/community-notes/new",
    },
  ],
};

const communityNoteSlice = createSlice({
  name: "community-note",
  initialState,
  reducers: {},
});

export const COMMUNITY_NOTE_ACTION = communityNoteSlice.actions;

export default communityNoteSlice.reducer;
