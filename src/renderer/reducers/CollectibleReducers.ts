import { AnyAction, Reducer } from "redux";
import actionTypes from "renderer/actions/ActionTypes";
import { NFTCollectionDataApi } from "renderer/models";

type CollectibleReducerState = {
  data: Array<NFTCollectionDataApi>;
};

const initialState: CollectibleReducerState = {
  data: [],
};

const collectibleReducers: Reducer<CollectibleReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.COLLECTIBLE_SUCCESS: {
      const { data } = payload;
      return {
        ...state,
        data,
      };
    }
    default:
      return state;
  }
};

export default collectibleReducers;
