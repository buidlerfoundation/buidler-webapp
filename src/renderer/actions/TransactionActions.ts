import { ActionCreator, Dispatch } from "redux";
import api from "renderer/api";
import actionTypes from "./ActionTypes";

export const getTransactions: ActionCreator<any> =
  (page: number, isFresh = false) =>
  async (dispatch: Dispatch) => {
    // if (page > 1) {
    //   dispatch({ type: actionTypes.TRANSACTION_MORE });
    // } else if (isFresh) {
    //   dispatch({ type: actionTypes.TRANSACTION_FRESH });
    // } else {
    //   dispatch({ type: actionTypes.TRANSACTION_REQUEST });
    // }
    // const res = await api.fetchTransaction({ page });
    // if (res.statusCode === 200) {
    //   dispatch({
    //     type: actionTypes.TRANSACTION_SUCCESS,
    //     payload: { data: res.data, page, canMore: res.data?.length === 20 },
    //   });
    // }
  };
