import { AnyAction, Reducer } from "redux";
import { normalizeMessage } from "renderer/helpers/MessageHelper";
import { MessageData } from "renderer/models";
import actionTypes from "../actions/ActionTypes";
import { differenceBy } from "lodash";

type MessageReducerState = {
  messageData: {
    [key: string]: {
      canMore: boolean;
      data: Array<MessageData>;
      scrollData: { showScrollDown: boolean; unreadCount?: number };
    };
  };
  apiController?: AbortController | null;
};

const initialState: MessageReducerState = {
  messageData: {},
  apiController: null,
};

const messageReducers: Reducer<MessageReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.DELETE_TASK_REQUEST: {
      const { taskId, channelId } = payload;
      const newMessageData = state.messageData;
      if (newMessageData[channelId]) {
        newMessageData[channelId] = {
          ...newMessageData[channelId],
          data: newMessageData[channelId]?.data?.map?.((msg) => {
            if (msg.message_id === taskId) {
              msg.task = undefined;
            }
            return msg;
          }),
        };
      }
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.MESSAGE_FRESH:
    case actionTypes.MESSAGE_REQUEST: {
      return {
        ...state,
        apiController: payload.controller,
      };
    }
    case actionTypes.MESSAGE_SUCCESS: {
      const { channelId, data, before, reloadSocket } = payload;
      let msg = data || [];
      let scrollData = state.messageData?.[channelId]?.scrollData;
      const currentData = state.messageData[channelId]?.data || [];
      if (reloadSocket) {
        const diff = differenceBy(
          currentData.filter(
            (el) => el.createdAt >= data?.[data.length - 1]?.createdAt
          ),
          data,
          "message_id"
        );
        scrollData = {
          showScrollDown: false,
        };
        msg = [...diff, ...msg];
      } else if (
        (before || data.length === 0) &&
        state.messageData?.[channelId]?.data
      ) {
        msg = [...currentData, ...data];
      } else {
        scrollData = {
          showScrollDown: false,
        };
      }
      return {
        ...state,
        messageData: {
          ...state.messageData,
          [channelId]: {
            data: normalizeMessage(msg),
            canMore: data.length !== 0,
            scrollData,
          },
        },
        apiController: null,
      };
    }
    case actionTypes.REMOVE_MESSAGE_ATTACHMENT: {
      const { messageId, fileId, channelId } = payload;
      const newMessageData = state.messageData;
      if (newMessageData[channelId]) {
        newMessageData[channelId] = {
          ...newMessageData[channelId],
          data: newMessageData[channelId].data.map((el) => {
            if (el.message_id === messageId) {
              el.message_attachments = el.message_attachments.filter(
                (item) => item.file_id !== fileId
              );
            }
            return el;
          }),
        };
      }
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.SET_CHANNEL_SCROLL_DATA: {
      const { data, channelId } = payload;
      const newMessageData = state.messageData;
      if (newMessageData[channelId]) {
        newMessageData[channelId] = {
          ...newMessageData[channelId],
          scrollData: {
            ...newMessageData[channelId].scrollData,
            ...data,
          },
        };
      }
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.DELETE_MESSAGE: {
      const { messageId, channelId, parentId } = payload;
      const newMessageData = state.messageData;
      if (newMessageData[channelId]) {
        const currentIdx = newMessageData[channelId].data.findIndex(
          (el) => el.message_id === messageId
        );
        const currentMsg = newMessageData[channelId].data?.[currentIdx];
        newMessageData[channelId] = {
          ...newMessageData[channelId],
          data: newMessageData[channelId].data
            .filter((el) => el.message_id !== messageId)
            .map((el, index) => {
              if (el.parent_id === parentId) {
                el.conversation_data = undefined;
              }
              if (currentIdx === index + 1) {
                return {
                  ...el,
                  isHead: currentMsg?.isHead,
                  isConversationHead: currentMsg?.isConversationHead,
                };
              }
              return el;
            }),
        };
      }
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.EDIT_MESSAGE: {
      const { data } = payload;
      const {
        entity_id,
        message_id,
        content,
        task,
        parent_id,
        message_attachments,
        plain_text,
      } = data;
      const newMessageData = state.messageData;
      if (newMessageData[entity_id]) {
        newMessageData[entity_id] = {
          ...newMessageData[entity_id],
          data: newMessageData[entity_id]?.data?.map?.((msg) => {
            if (msg.message_id === message_id) {
              msg.content = content;
              msg.plain_text = plain_text;
              msg.task = msg.task
                ? {
                    ...msg.task,
                    ...task,
                  }
                : null;
              msg.message_attachments = message_attachments;
            }
            if (msg.parent_id === parent_id && msg.conversation_data) {
              msg.conversation_data = {
                ...msg.conversation_data,
                content,
                plain_text,
                task,
                message_attachments,
              };
            }
            return msg;
          }),
        };
      }
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.EMIT_NEW_MESSAGE: {
      const newMessageData = state.messageData;
      if (newMessageData[payload.entity_id]?.data) {
        newMessageData[payload.entity_id] = {
          ...newMessageData[payload.entity_id],
          data: normalizeMessage([
            payload,
            ...newMessageData[payload.entity_id].data.map((msg) => {
              if (
                msg.parent_id === payload.parent_id ||
                msg.message_id === payload.parent_id
              ) {
                msg.conversation_data = payload.conversation_data;
              }
              if (
                msg.message_id === payload.parent_id ||
                msg.parent_id === payload.parent_id
              ) {
                msg.parent_id = payload.parent_id;
              }
              return msg;
            }),
          ]),
        };
      } else {
        newMessageData[payload.entity_id] = {
          data: normalizeMessage([payload]),
          canMore: true,
          scrollData: { showScrollDown: false, unreadCount: 0 },
        };
      }
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.RECEIVE_MESSAGE: {
      const { data } = payload;
      const newMessageData = state.messageData;
      if (newMessageData[data.entity_id]?.data) {
        const isExited = !!newMessageData[data.entity_id]?.data?.find?.(
          (el) => el.message_id === data.message_id
        );
        if (isExited) {
          newMessageData[data.entity_id] = {
            ...newMessageData[data.entity_id],
            data: normalizeMessage(
              newMessageData[data.entity_id].data.map((msg) => {
                if (msg.message_id === data.message_id) {
                  return data;
                }
                return msg;
              })
            ),
          };
        } else {
          newMessageData[data.entity_id] = {
            ...newMessageData[data.entity_id],
            data: normalizeMessage([
              data,
              ...newMessageData[data.entity_id].data.map((msg) => {
                if (
                  msg.parent_id === data.parent_id ||
                  msg.message_id === data.parent_id
                ) {
                  msg.conversation_data = data.conversation_data;
                }
                if (
                  msg.message_id === data.parent_id ||
                  msg.parent_id === data.parent_id
                ) {
                  msg.parent_id = data.parent_id;
                }
                return msg;
              }),
            ]),
          };
        }
      } else {
        newMessageData[data.entity_id] = {
          data: normalizeMessage([data]),
          canMore: true,
          scrollData: { showScrollDown: false, unreadCount: 0 },
        };
      }
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.LOGOUT: {
      return {
        messageData: {},
      };
    }
    default:
      return state;
  }
};

export default messageReducers;
