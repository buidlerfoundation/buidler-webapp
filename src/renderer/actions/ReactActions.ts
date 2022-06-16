import { Dispatch } from 'redux';
import api from '../api';

export const addReact =
  (id: string, reactName: string, userId: string) =>
  async (dispatch: Dispatch) => {
    api.addReaction(id, { emoji_id: reactName, skin: 1 });
    dispatch({
      type: 'ACTION_ADD_REACT',
      payload: { id, reactName, userId },
    });
  };

export const removeReact =
  (id: string, reactName: string, userId: string) =>
  async (dispatch: Dispatch) => {
    api.removeReaction(id, { emoji_id: reactName });
    dispatch({
      type: 'ACTION_REMOVE_REACT',
      payload: { id, reactName, userId },
    });
  };
