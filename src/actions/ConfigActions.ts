import { ActionCreator, Dispatch } from 'redux';
import ActionTypes from './ActionTypes';

export const setTheme: ActionCreator<any> =
  (theme) => async (dispatch: Dispatch) => {
    // TODO set theme
    dispatch({ type: ActionTypes.SET_THEME, payload: { theme } });
  };
