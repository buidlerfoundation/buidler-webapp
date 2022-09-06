import { ActionCreator, Dispatch } from "redux";
import {
  normalizeMessageData,
  normalizePublicMessageData,
} from "renderer/helpers/ChannelHelper";
import store from "renderer/store";
import SocketUtils from "renderer/utils/SocketUtils";
import api from "../api";
import actionTypes from "./ActionTypes";

export const getAroundMessage =
  (messageId: string, channelId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.MESSAGE_REQUEST,
      payload: { messageId, channelId },
    });
    try {
      const messageRes = await api.getAroundMessageById(messageId);
      const messageData = normalizePublicMessageData(messageRes.data || []);
      if (messageRes.statusCode === 200) {
        dispatch({
          type: actionTypes.MESSAGE_SUCCESS,
          payload: {
            data: messageData,
            channelId,
            messageId,
          },
        });
      } else {
        dispatch({
          type: actionTypes.MESSAGE_FAIL,
          payload: messageRes,
        });
      }
      return messageRes.statusCode === 200;
    } catch (error) {
      dispatch({
        type: actionTypes.MESSAGE_FAIL,
        payload: { message: error },
      });
      return false;
    }
  };

export const deleteMessage: ActionCreator<any> =
  (messageId: string, parentId: string, channelId: string) =>
  async (dispatch: Dispatch) => {
    api.deleteMessage(messageId);
  };

export const getConversations: ActionCreator<any> =
  (parentId: string, before?: string, isFresh = false) =>
  async (dispatch: Dispatch) => {
    if (before) {
      dispatch({ type: actionTypes.CONVERSATION_MORE, payload: { parentId } });
    } else if (isFresh) {
      dispatch({ type: actionTypes.CONVERSATION_FRESH, payload: { parentId } });
    } else {
      dispatch({
        type: actionTypes.CONVERSATION_REQUEST,
        payload: { parentId },
      });
    }
    const messageRes = await api.getConversation(parentId, 20, before);
    if (messageRes.statusCode === 200) {
      dispatch({
        type: actionTypes.CONVERSATION_SUCCESS,
        payload: { data: messageRes.data, parentId, before, isFresh },
      });
    }
  };

export const onRemoveAttachment: ActionCreator<any> =
  (channelId: string, messageId: string, fileId: string) =>
  async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.REMOVE_MESSAGE_ATTACHMENT,
      payload: { channelId, messageId, fileId },
    });
  };

export const getPinPostMessages: ActionCreator<any> =
  (postId: string, before?: string, isFresh = false) =>
  async (dispatch: Dispatch) => {
    const { ppApiController } = store.getState().message;
    ppApiController?.abort?.();
    const controller = new AbortController();
    if (before) {
      dispatch({ type: actionTypes.MESSAGE_PP_MORE, payload: { postId } });
    } else if (isFresh) {
      dispatch({
        type: actionTypes.MESSAGE_PP_FRESH,
        payload: { postId, controller },
      });
    } else {
      dispatch({
        type: actionTypes.MESSAGE_PP_REQUEST,
        payload: { postId, controller },
      });
    }
    try {
      const messageRes = await api.getPinPostMessage(
        postId,
        20,
        before,
        undefined,
        controller
      );
      const messageData = normalizePublicMessageData(messageRes.data || []);
      if (messageRes.statusCode === 200) {
        dispatch({
          type: actionTypes.MESSAGE_PP_SUCCESS,
          payload: {
            data: messageData,
            channelId: postId,
            before,
            isFresh,
            reloadSocket: !before,
          },
        });
      } else {
        dispatch({
          type: actionTypes.MESSAGE_PP_FAIL,
          payload: messageRes,
        });
      }
    } catch (error) {
      dispatch({
        type: actionTypes.MESSAGE_PP_FAIL,
        payload: { message: error },
      });
    }
  };

export const getMessages: ActionCreator<any> =
  (
    channelId: string,
    channelType: string,
    before?: string,
    after?: string,
    isFresh = false
  ) =>
  async (dispatch: Dispatch) => {
    const { apiController, messageData } = store.getState().message;
    apiController?.abort?.();
    if (!before) {
      const messages = messageData?.[channelId]?.data;
      SocketUtils.emitSeenChannel(messages?.[0]?.message_id, channelId);
    }
    const controller = new AbortController();
    if (before) {
      dispatch({ type: actionTypes.MESSAGE_MORE, payload: { channelId } });
    } else if (isFresh) {
      dispatch({
        type: actionTypes.MESSAGE_FRESH,
        payload: { channelId, controller },
      });
    } else {
      dispatch({
        type: actionTypes.MESSAGE_REQUEST,
        payload: { channelId, controller, after },
      });
    }
    try {
      const messageRes = await api.getMessages(
        channelId,
        50,
        before,
        after,
        controller
      );
      if (!before) {
        SocketUtils.emitSeenChannel(
          messageRes.data?.[0]?.message_id,
          channelId
        );
      }
      const isPrivate = channelType === "Private" || channelType === "Direct";
      const messageData = isPrivate
        ? await normalizeMessageData(messageRes.data || [], channelId)
        : normalizePublicMessageData(messageRes.data || []);
      if (messageRes.statusCode === 200) {
        dispatch({
          type: actionTypes.MESSAGE_SUCCESS,
          payload: {
            data: messageData,
            channelId,
            before,
            isFresh,
            after,
            reloadSocket: !before && !after,
          },
        });
      } else {
        dispatch({
          type: actionTypes.MESSAGE_FAIL,
          payload: messageRes,
        });
      }
      return messageRes.data?.[messageRes.data.length - 1]?.message_id;
    } catch (error) {
      dispatch({
        type: actionTypes.MESSAGE_FAIL,
        payload: { message: error },
      });
      return false;
    }
  };

export const setScrollData: ActionCreator<any> =
  (channelId: string, data: any) => (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.SET_CHANNEL_SCROLL_DATA,
      payload: { channelId, data },
    });
  };
