import { AnyAction, Reducer } from "redux";
import actionTypes from "renderer/actions/ActionTypes";
import { ENSAsset, NFTCollectionDataApi } from "renderer/models";

type CollectibleReducerState = {
  data: NFTCollectionDataApi[];
  ensAssets: ENSAsset[];
};

const initialState: CollectibleReducerState = {
  data: [],
  ensAssets: [],
};

const collectibleReducers: Reducer<CollectibleReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.COLLECTIBLE_SUCCESS: {
      const { data, ensAssets } = payload;
      return {
        ...state,
        data,
        ensAssets,
      };
    }
    default:
      return state;
  }
};

export default collectibleReducers;
