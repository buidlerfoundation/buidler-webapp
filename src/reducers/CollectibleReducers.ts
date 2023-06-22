import { createSlice } from "@reduxjs/toolkit";
import { ENSAsset, NFTCollectionDataApi } from "models/User";
import { logoutAction } from "./UserActions";

type CollectibleReducerState = {
  data: NFTCollectionDataApi[];
  ensAssets: ENSAsset[];
};

const initialState: CollectibleReducerState = {
  data: [],
  ensAssets: [],
};

const collectibleSlice = createSlice({
  name: "collectible",
  initialState,
  reducers: {},
  extraReducers: (builder) => builder.addCase(logoutAction, () => initialState),
});

export const COLLECTIBLE_ACTIONS = collectibleSlice.actions;

export default collectibleSlice.reducer;
