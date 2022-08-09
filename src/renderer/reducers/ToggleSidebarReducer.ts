import { AnyAction, Reducer } from "redux";
import actionTypes from "../actions/ActionTypes";

type ToggleSidebarState = {
  spaceExpandMap: { [key: string]: boolean };
};

const initialState: ToggleSidebarState = {
  spaceExpandMap: {},
};

const toggleSidebarReducers: Reducer<ToggleSidebarState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.UPDATE_EXPAND_SPACE_ITEM: {
      const { spaceId, isExpand } = payload;
      return {
        ...state,
        spaceExpandMap: {
          ...state.spaceExpandMap,
          [spaceId]: isExpand,
        },
      };
    }
    case actionTypes.CREATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceExpandMap: {
          ...state.spaceExpandMap,
          [payload.space_id]: true,
        },
      };
    }
    default:
      return state;
  }
};

export default toggleSidebarReducers;
