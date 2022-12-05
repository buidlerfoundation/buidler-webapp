import { ActionCreator, Dispatch } from "redux";
import { AsyncKey } from "renderer/common/AppConfig";
import { getCookie, setCookie } from "renderer/common/Cookie";
import { AppGetState } from "renderer/store";
import actionTypes from "./ActionTypes";

export const initialSpaceToggle: ActionCreator<any> =
  () => async (dispatch: Dispatch) => {
    const spaceToggleLocal = await getCookie(AsyncKey.spaceToggleKey);
    let newSpaceToggle = {};
    if (spaceToggleLocal && typeof spaceToggleLocal === "string") {
      newSpaceToggle = JSON.parse(spaceToggleLocal);
    }
    dispatch({
      type: actionTypes.UPDATE_SPACE_TOGGLE,
      payload: newSpaceToggle,
    });
  };

export const updateSpaceToggle: ActionCreator<any> =
  (spaceId: string, isExpand: boolean) =>
  async (dispatch: Dispatch, getState: AppGetState) => {
    const { spaceToggle } = getState().sideBar;
    const newSpaceToggle = {
      ...spaceToggle,
      [spaceId]: isExpand,
    };
    setCookie(AsyncKey.spaceToggleKey, JSON.stringify(newSpaceToggle));
    dispatch({
      type: actionTypes.UPDATE_SPACE_TOGGLE,
      payload: newSpaceToggle,
    });
  };
