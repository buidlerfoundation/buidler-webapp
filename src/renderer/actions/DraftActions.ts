import { Dispatch } from "redux";
import { AsyncKey } from "renderer/common/AppConfig";
import { getCookie, setCookie } from "renderer/common/Cookie";
import actionTypes from "./ActionTypes";
import { AppGetState } from "renderer/store";

export const initialDraft = () => async (dispatch: Dispatch) => {
  const dataLocal = await getCookie(AsyncKey.draftMessageKey);
  try {
    const data = JSON.parse(dataLocal);
    dispatch({ type: actionTypes.INITIAL_DRAFT, payload: data });
  } catch (error) {}
};

export const updateDraft =
  (entityId: string, data?: { text: string }) =>
  async (dispatch: Dispatch, getState: AppGetState) => {
    const currentDraftData = getState().draft.data;
    const newDraftData = {
      ...currentDraftData,
      [entityId]: data,
    };
    setCookie(AsyncKey.draftMessageKey, JSON.stringify(newDraftData));
    dispatch({
      type: actionTypes.UPDATE_DRAFT,
      payload: { entityId, text: data?.text },
    });
  };
