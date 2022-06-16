import { AnyAction, Reducer } from "redux";
import { MessageData } from "renderer/models";
import actionTypes from "../actions/ActionTypes";

type MessageReducerState = {
  conversationData: { [key: string]: Array<MessageData> };
  messageData: {
    [key: string]: {
      canMore: boolean;
      data: Array<MessageData>;
      scrollData: { showScrollDown: boolean; unreadCount?: number };
    };
  };
};

const initialState: MessageReducerState = {
  messageData: {},
  conversationData: {},
};

const messageReducers: Reducer<MessageReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.CONVERSATION_SUCCESS: {
      const { parentId, data, before, isFresh } = payload;
      let cvs = data;
      if (before && state.conversationData?.[parentId]) {
        cvs = [...state.conversationData[parentId], ...data];
      }
      return {
        ...state,
        conversationData: {
          ...state.conversationData,
          [parentId]: cvs,
        },
      };
    }
    case actionTypes.MESSAGE_SUCCESS: {
      const { channelId, data, before, isFresh } = payload;
      let msg = data;
      let scrollData = state.messageData?.[channelId]?.scrollData;
      if (
        (before || data.length === 0) &&
        state.messageData?.[channelId]?.data
      ) {
        msg = [...state.messageData[channelId].data, ...data];
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
            data: msg,
            canMore: data.length !== 0,
            scrollData,
          },
        },
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
              el.message_attachment = el.message_attachment.filter(
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
        newMessageData[channelId] = {
          ...newMessageData[channelId],
          data: newMessageData[channelId].data
            .filter((el) => el.message_id !== messageId)
            .map((el) => {
              if (el.parent_id === parentId) {
                el.conversation_data = el.conversation_data.filter(
                  (c) => c.message_id !== messageId
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
    case actionTypes.EDIT_MESSAGE: {
      const { data } = payload;
      const {
        channel_id,
        message_id,
        content,
        task,
        parent_id,
        message_attachment,
        plain_text,
      } = data;
      const newMessageData = state.messageData;
      const newConversationData = state.conversationData;
      if (newConversationData[parent_id]) {
        newConversationData[parent_id] = newConversationData[parent_id].map(
          (el) => {
            if (el.message_id === message_id) {
              el.content = content;
              el.plain_text = plain_text;
              el.task = task;
              el.message_attachment = message_attachment;
            }
            return el;
          }
        );
      }
      if (newMessageData[channel_id]) {
        newMessageData[channel_id] = {
          ...newMessageData[channel_id],
          data: newMessageData[channel_id]?.data?.map?.((msg) => {
            if (msg.message_id === message_id) {
              msg.content = content;
              msg.plain_text = plain_text;
              msg.task = task;
              msg.message_attachment = message_attachment;
            }
            if (msg.parent_id === parent_id) {
              msg.conversation_data = msg.conversation_data.map((el) => {
                if (el.message_id === message_id) {
                  el.content = content;
                  el.plain_text = plain_text;
                  el.task = task;
                  el.message_attachment = message_attachment;
                }
                return el;
              });
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
      if (newMessageData[payload.channel_id]?.data) {
        newMessageData[payload.channel_id] = {
          ...newMessageData[payload.channel_id],
          data: [
            payload,
            ...newMessageData[payload.channel_id].data.map((msg) => {
              if (
                msg.parent_id === payload.parent_id ||
                msg.message_id === payload.parent_id
              ) {
                msg.conversation_data = payload.conversation_data;
              }
              if (msg.message_id === payload.parent_id) {
                msg.parent_id = payload.parent_id;
                if (msg.task) {
                  msg.task.comment_count = msg.task.comment_count
                    ? msg.task.comment_count + 1
                    : msg.conversation_data.length - 1;
                }
              }
              return msg;
            }),
          ],
        };
      } else {
        newMessageData[payload.channel_id] = {
          data: [payload],
          canMore: true,
          scrollData: { showScrollDown: false, unreadCount: 0 },
        };
      }
      return {
        ...state,
      };
    }
    case actionTypes.RECEIVE_MESSAGE: {
      const { data } = payload;
      if (!data.conversation_data) {
        data.conversation_data = [];
      }
      const newMessageData = state.messageData;
      const newConversationData = state.conversationData;
      if (newConversationData[data.parent_id]) {
        newConversationData[data.parent_id] = data.conversation_data;
      }
      if (newMessageData[data.channel_id]?.data) {
        const isExited = !!newMessageData[data.channel_id]?.data?.find?.(
          (el) => el.message_id === data.message_id
        );
        if (isExited) {
          newMessageData[data.channel_id] = {
            ...newMessageData[data.channel_id],
            data: newMessageData[data.channel_id].data.map((msg) => {
              if (msg.message_id === data.message_id) {
                return data;
              }
              return msg;
            }),
          };
        } else {
          newMessageData[data.channel_id] = {
            ...newMessageData[data.channel_id],
            data: [
              data,
              ...newMessageData[data.channel_id].data.map((msg) => {
                if (
                  msg.parent_id === data.parent_id ||
                  msg.message_id === data.parent_id
                ) {
                  msg.conversation_data = data.conversation_data;
                }
                if (msg.message_id === data.parent_id) {
                  msg.parent_id = data.parent_id;
                  if (msg.task) {
                    msg.task.comment_count = msg.task.comment_count
                      ? msg.task.comment_count + 1
                      : msg.conversation_data.length - 1;
                  }
                }
                return msg;
              }),
            ],
          };
        }
      } else {
        newMessageData[data.channel_id] = {
          data: [data],
          canMore: true,
          scrollData: { showScrollDown: false, unreadCount: 0 },
        };
      }
      return {
        ...state,
        messageData: newMessageData,
        conversationData: newConversationData,
      };
    }
    case actionTypes.LOGOUT: {
      return {
        messageData: {},
        conversationData: {},
      };
    }
    default:
      return state;
  }
};

export default messageReducers;
