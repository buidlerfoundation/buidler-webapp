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
      canMoreAfter: boolean;
    };
  };
  apiController?: AbortController | null;
  ppApiController?: AbortController | null;
  highlightMessageId?: string;
  loadMoreAfterMessage?: boolean;
};

const initialState: MessageReducerState = {
  messageData: {},
  apiController: null,
  ppApiController: null,
  loadMoreAfterMessage: false,
};

const messageReducers: Reducer<MessageReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.UPLOAD_ATTACHMENT_SUCCESS: {
      const { file, file_url } = payload;
      const newMessageData = { ...state.messageData };
      if (file.entity_id && newMessageData?.[file.entity_id]) {
        newMessageData[file.entity_id] = {
          ...newMessageData?.[file.entity_id],
          data: newMessageData?.[file.entity_id]?.data?.map((el) => {
            if (el.message_id === file.attachment_id) {
              if (el.task && el.task.task_attachments) {
                el.task.task_attachments = el.task.task_attachments?.map(
                  (att) => {
                    if (att.file_id === file.file_id) {
                      return {
                        ...file,
                        file_url,
                      };
                    }
                    return att;
                  }
                );
              }
              return {
                ...el,
                message_attachments: el.message_attachments.map((att) => {
                  if (att.file_id === file.file_id) {
                    return {
                      ...file,
                      file_url,
                    };
                  }
                  return att;
                }),
              };
            }
            return el;
          }),
        };
      }
      return {
        ...state,
        messageData: { ...newMessageData },
      };
    }
    case actionTypes.UPDATE_HIGHLIGHT_MESSAGE: {
      return {
        ...state,
        highlightMessageId: payload,
      };
    }
    case actionTypes.UPDATE_TASK_REQUEST: {
      const { taskId, channelId, data } = payload;
      const newMessageData = { ...state.messageData };
      if (newMessageData[channelId]) {
        newMessageData[channelId] = {
          ...newMessageData[channelId],
          data: newMessageData[channelId]?.data?.map?.((msg) => {
            if (msg.message_id === taskId && msg.task) {
              msg.task = { ...msg.task, ...data };
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
    case actionTypes.DELETE_TASK_REQUEST: {
      const { taskId, channelId } = payload;
      const newMessageData = { ...state.messageData };
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
    case actionTypes.MESSAGE_PP_FRESH:
    case actionTypes.MESSAGE_PP_REQUEST: {
      return {
        ...state,
        ppApiController: payload.controller,
      };
    }
    case actionTypes.MESSAGE_FRESH:
    case actionTypes.MESSAGE_REQUEST: {
      return {
        ...state,
        apiController: payload.controller,
        loadMoreAfterMessage: !!payload.after,
      };
    }
    case actionTypes.MESSAGE_PP_SUCCESS:
    case actionTypes.MESSAGE_SUCCESS: {
      const {
        channelId,
        data,
        before,
        reloadSocket,
        messageId,
        after,
        canMoreAfter,
        canMoreBefore,
      } = payload;
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
      } else if (state.messageData?.[channelId]?.data) {
        if (!after && (before || data.length === 0)) {
          msg = [...currentData, ...data];
        } else if (after || data.length === 0) {
          msg = [...data, ...currentData];
          scrollData = {
            showScrollDown: data.length > 0,
          };
        }
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
            canMore:
              canMoreBefore !== undefined
                ? canMoreBefore
                : !after
                ? data.length !== 0
                : state.messageData?.[channelId]?.canMore,
            canMoreAfter:
              canMoreAfter !== undefined
                ? canMoreAfter
                : messageId
                ? true
                : after
                ? data.length !== 0
                : before
                ? state.messageData?.[channelId]?.canMoreAfter
                : false,
            scrollData,
          },
        },
        apiController: null,
        ppApiController: null,
        loadMoreAfterMessage: false,
      };
    }
    case actionTypes.REMOVE_MESSAGE_ATTACHMENT: {
      const { messageId, fileId, channelId } = payload;
      const newMessageData = { ...state.messageData };
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
      const { messageId, channelId, currentChannelId } = payload;
      const newMessageData = { ...state.messageData };
      if (currentChannelId !== channelId && newMessageData[currentChannelId]) {
        const currentIdx = newMessageData[currentChannelId].data.findIndex(
          (el) => el.message_id === messageId
        );
        const currentMsg = newMessageData[currentChannelId].data?.[currentIdx];
        const data = newMessageData[currentChannelId].data
          .filter((el) => el.message_id !== messageId)
          .map((el, index) => {
            if (el.reply_message_id === messageId) {
              el.conversation_data = undefined;
              return {
                ...el,
              };
            }
            if (el.message_id === channelId && el.task) {
              el.task = {
                ...el.task,
                total_messages: `${
                  parseInt(el.task.total_messages || "0") - 1
                }`,
              };
              return {
                ...el,
              };
            }
            if (currentIdx === index + 1) {
              return {
                ...el,
                isHead: el.isHead || currentMsg?.isHead,
                isConversationHead:
                  el.isConversationHead || currentMsg?.isConversationHead,
              };
            }
            return el;
          });
        newMessageData[currentChannelId] = {
          ...newMessageData[currentChannelId],
          data,
          scrollData: {
            unreadCount:
              data.length > 0
                ? newMessageData[currentChannelId]?.scrollData?.unreadCount || 0
                : 0,
            showScrollDown:
              data.length > 0
                ? newMessageData[currentChannelId]?.scrollData?.showScrollDown
                : false,
          },
        };
      }
      if (newMessageData[channelId]) {
        const currentIdx = newMessageData[channelId].data.findIndex(
          (el) => el.message_id === messageId
        );
        const currentMsg = newMessageData[channelId].data?.[currentIdx];
        const data = newMessageData[channelId].data
          .filter((el) => el.message_id !== messageId)
          .map((el, index) => {
            if (el.reply_message_id === messageId) {
              el.conversation_data = undefined;
              return {
                ...el,
              };
            }
            if (currentIdx === index + 1) {
              return {
                ...el,
                isHead: el.isHead || currentMsg?.isHead,
                isConversationHead:
                  el.isConversationHead || currentMsg?.isConversationHead,
              };
            }
            return el;
          });
        newMessageData[channelId] = {
          ...newMessageData[channelId],
          data,
          scrollData: {
            unreadCount:
              data.length > 0
                ? newMessageData[channelId]?.scrollData?.unreadCount || 0
                : 0,
            showScrollDown:
              data.length > 0
                ? newMessageData[channelId]?.scrollData?.showScrollDown
                : false,
          },
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
        message_attachments,
        plain_text,
        updatedAt,
        is_scam_detected,
      } = data;
      const newMessageData = { ...state.messageData };
      if (newMessageData[entity_id]) {
        newMessageData[entity_id] = {
          ...newMessageData[entity_id],
          data: newMessageData[entity_id]?.data?.map?.((msg) => {
            if (msg.message_id === message_id) {
              msg.content = content;
              msg.plain_text = plain_text;
              msg.task =
                msg.task || task
                  ? {
                      ...(msg.task || {}),
                      ...task,
                    }
                  : null;
              msg.message_attachments = message_attachments;
              msg.updatedAt = updatedAt;
              msg.is_scam_detected = is_scam_detected;
              return { ...msg };
            }
            if (msg.reply_message_id === message_id && msg.conversation_data) {
              msg.conversation_data = {
                ...msg.conversation_data,
                content,
                plain_text,
                task,
                message_attachments,
                updatedAt,
                is_scam_detected,
              };
              return { ...msg };
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
      const newMessageData = { ...state.messageData };
      if (newMessageData[payload.entity_id]?.data) {
        newMessageData[payload.entity_id] = {
          ...newMessageData[payload.entity_id],
          data: normalizeMessage([
            payload,
            ...newMessageData[payload.entity_id].data,
          ]),
        };
      } else {
        newMessageData[payload.entity_id] = {
          data: normalizeMessage([payload]),
          canMore: true,
          scrollData: { showScrollDown: false, unreadCount: 0 },
          canMoreAfter: true,
        };
      }
      return {
        ...state,
        messageData: newMessageData,
      };
    }
    case actionTypes.RECEIVE_MESSAGE: {
      const { data, currentChannelId } = payload;
      const newMessageData = { ...state.messageData };
      if (data.entity_type === "post") {
        if (newMessageData[currentChannelId]?.data) {
          newMessageData[currentChannelId] = {
            ...newMessageData[currentChannelId],
            data: normalizeMessage(
              newMessageData[currentChannelId].data.map((msg) => {
                if (msg.message_id === data.entity_id && msg.task) {
                  msg.task = {
                    ...msg.task,
                    latest_reply_senders: [
                      data.sender_id,
                      ...(msg.task.latest_reply_senders?.filter(
                        (el) => el !== data.sender_id
                      ) || []),
                    ],
                    latest_reply_message_at: data.createdAt,
                    total_messages: `${
                      parseInt(msg.task.total_messages || "0") + 1
                    }`,
                  };
                }
                return msg;
              })
            ),
          };
        }
      }
      if (newMessageData[data.entity_id]?.data) {
        if (!newMessageData[data.entity_id]?.canMoreAfter) {
          const isExited = !!newMessageData[data.entity_id]?.data?.find?.(
            (el) => el.message_id === data.message_id
          );
          if (isExited) {
            newMessageData[data.entity_id] = {
              ...newMessageData[data.entity_id],
              data: normalizeMessage(
                newMessageData[data.entity_id].data.map((msg) => {
                  if (msg.message_id === data.message_id) {
                    const newMsg = data;
                    if (msg.files && newMsg?.message_attachments?.length > 0) {
                      newMsg.message_attachments =
                        newMsg.message_attachments.map((attachment) => {
                          if (attachment.is_uploaded === false) {
                            attachment.localFile = msg.files?.find(
                              (file) => file.randomId === attachment.file_id
                            );
                          }
                          return attachment;
                        });
                    }
                    return newMsg;
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
                ...newMessageData[data.entity_id].data,
              ]),
            };
          }
        }
      } else {
        newMessageData[data.entity_id] = {
          data: normalizeMessage([data]),
          canMore: true,
          scrollData: { showScrollDown: false, unreadCount: 0 },
          canMoreAfter: false,
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
