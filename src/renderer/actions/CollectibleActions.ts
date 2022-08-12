import { ActionCreator, Dispatch } from "redux";
import api from "renderer/api";
import actionTypes from "./ActionTypes";

export const getCollectibles: ActionCreator<any> =
  () => async (dispatch: Dispatch) => {
    dispatch({ type: actionTypes.COLLECTIBLE_REQUEST });
    const res = await api.fetchNFTCollection();
    if (res.statusCode === 200) {
      dispatch({
        type: actionTypes.COLLECTIBLE_SUCCESS,
        payload: { data: res.data },
      });
    } else {
      dispatch({
        type: actionTypes.COLLECTIBLE_FAIL,
        payload: res,
      });
    }
  };
