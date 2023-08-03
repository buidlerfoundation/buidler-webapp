import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { normalizeMessage } from "helpers/MessageHelper";
import { GeneratedPrivateKey } from "common/Cookie";
import api from "api";
import { normalizePublicMessageData } from "helpers/ChannelHelper";
import {
  ActiveTab,
  MessageData,
  PayloadMessageListAction,
} from "models/Message";
import { UserData } from "models/User";
import { channelChanged } from "./actions";

interface MessageState {
  messageData: {
    [key: string]: {
      canMore: boolean;
      data: MessageData[];
      canMoreAfter: boolean;
      loading?: boolean;
      loadMore?: boolean;
      loadMoreAfter?: boolean;
    };
  };
  apiController?: AbortController | null;
  highlightMessageId?: string;
  chatBoxActiveTab: ActiveTab;
}

const initialState: MessageState = {
  messageData: {},
  apiController: null,
  chatBoxActiveTab: "",
};

export const getMessages = createAsyncThunk(
  "message/get",
  async (payload: { channelId: string; before?: string; after?: string }) => {
    const { channelId, before, after } = payload;
    const messageRes = await api.getMessages(
      channelId,
      undefined,
      before,
      after
    );
    if (messageRes.statusCode === 200) {
      let messageData = messageRes.data;
      if (messageRes.metadata?.encrypt_message_key) {
        const privateKey = await GeneratedPrivateKey();
        messageData = normalizePublicMessageData(
          messageRes.data,
          privateKey,
          messageRes.metadata?.encrypt_message_key
        );
      }
      return {
        channelId,
        data: messageData,
        before,
        after,
      };
    }
  }
);

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    updateUser: (
      state,
      action: PayloadAction<{ user: UserData; channelId: string }>
    ) => {
      const { user, channelId } = action.payload;
      state.messageData = {
        ...state.messageData,
        [channelId]: {
          ...state.messageData?.[channelId],
          data: state.messageData?.[channelId]?.data?.map((el) => {
            if (el.conversation_data?.sender?.user_id === user.user_id) {
              return {
                ...el,
                conversation_data: {
                  ...el.conversation_data,
                  sender: user,
                },
              };
            }
            if (el.sender?.user_id === user.user_id) {
              return {
                ...el,
                sender: user,
              };
            }
            return el;
          }),
        },
      };
    },
    updateList: (
      state: MessageState,
      action: PayloadAction<PayloadMessageListAction>
    ) => {
      const {
        data,
        after,
        before,
        channelId,
        canMoreBefore,
        canMoreAfter,
        messageId,
      } = action.payload;
      const currentData = state.messageData?.[channelId]?.data || [];
      let msg = data;
      if (!after && (before || data.length === 0)) {
        msg = [...currentData, ...data];
      } else if (after || data.length === 0) {
        msg = [...data, ...currentData];
      }
      state.messageData[channelId] = {
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
      };
    },
    deleteMessage: (
      state: MessageState,
      action: PayloadAction<{ messageId: string; entityId: string }>
    ) => {
      const { messageId, entityId } = action.payload;
      const newMessageData = { ...state.messageData };
      if (newMessageData[entityId]) {
        const currentIdx = newMessageData[entityId].data.findIndex(
          (el) => el.message_id === messageId
        );
        const currentMsg = newMessageData[entityId].data?.[currentIdx];
        const data = newMessageData[entityId].data
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
        newMessageData[entityId] = {
          ...newMessageData[entityId],
          data,
        };
      }
      state.messageData = newMessageData;
    },
    editMessage: (state: MessageState, action: PayloadAction<MessageData>) => {
      const {
        entity_id,
        message_id,
        content,
        topic,
        attachments,
        plain_text,
        updated_at,
        is_scam_detected,
      } = action.payload;
      const newMessageData = { ...state.messageData };
      if (newMessageData[entity_id]) {
        newMessageData[entity_id] = {
          ...newMessageData[entity_id],
          data: newMessageData[entity_id]?.data?.map?.((msg) => {
            if (msg.message_id === message_id) {
              msg.content = content;
              msg.plain_text = plain_text;
              if (msg.topic || topic) {
                if (msg.topic) {
                  msg.topic = {
                    ...msg.topic,
                    ...topic,
                  };
                } else {
                  msg.topic = topic;
                }
              } else {
                msg.topic = undefined;
              }
              msg.attachments = attachments;
              msg.updated_at = updated_at;
              msg.is_scam_detected = is_scam_detected;
              return { ...msg };
            }
            if (msg.reply_message_id === message_id && msg.conversation_data) {
              msg.conversation_data = {
                ...msg.conversation_data,
                content,
                plain_text,
                topic,
                attachments,
                updated_at,
                is_scam_detected,
              };
              return { ...msg };
            }
            return msg;
          }),
        };
      }
      state.messageData = newMessageData;
    },
    emitMessage: (state: MessageState, action: PayloadAction<MessageData>) => {
      const message = action.payload;
      if (state.messageData?.[message.entity_id]) {
        state.messageData[message.entity_id].data = normalizeMessage([
          message,
          ...state.messageData[message.entity_id].data,
        ]);
      } else {
        state.messageData[message.entity_id] = {
          data: normalizeMessage([message]),
          canMore: true,
          canMoreAfter: false,
        };
      }
    },
    newMessage: (state: MessageState, action: PayloadAction<MessageData>) => {
      const message = action.payload;
      if (state.messageData?.[message.entity_id]) {
        const isExited = !!state.messageData[message.entity_id]?.data?.find?.(
          (el) => el.message_id === message.message_id
        );
        if (isExited) {
          state.messageData[message.entity_id].data = normalizeMessage(
            state.messageData[message.entity_id].data.map((el) => {
              if (el.message_id === message.message_id) {
                return message;
              }
              return el;
            })
          );
        } else {
          state.messageData[message.entity_id].data = normalizeMessage([
            message,
            ...state.messageData[message.entity_id].data,
          ]);
        }
      } else {
        state.messageData[message.entity_id] = {
          data: normalizeMessage([message]),
          canMore: true,
          canMoreAfter: false,
        };
      }
    },
    updateActiveTab: (
      state: MessageState,
      action: PayloadAction<ActiveTab>
    ) => {
      state.chatBoxActiveTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(channelChanged, (state) => {
        state.chatBoxActiveTab = "";
      })
      .addCase(getMessages.pending, (state, action) => {
        const { channelId, before, after } = action.meta.arg;
        state.messageData = {
          ...state.messageData,
          [channelId]: {
            ...(state.messageData[channelId] || {}),
            loading: !before && !after,
            loadMore: !!before && !after,
            loadMoreAfter: !!after && !before,
          },
        };
      })
      .addCase(getMessages.rejected, (state, action) => {
        if (action.error.name !== "AbortError") {
          const { channelId } = action.meta.arg;
          state.messageData = {
            ...state.messageData,
            [channelId]: {
              ...(state.messageData[channelId] || {}),
              loading: false,
              loadMore: false,
              loadMoreAfter: false,
            },
          };
        }
      })
      .addCase(getMessages.fulfilled, (state: MessageState, action: any) => {
        if (!action.payload) return;
        const {
          data,
          after,
          before,
          channelId,
          canMoreBefore,
          canMoreAfter,
          messageId,
        } = action.payload;
        const currentData = state.messageData?.[channelId]?.data || [];
        let msg = data;
        if (!after && (before || data.length === 0)) {
          msg = [...currentData, ...data];
        } else if (after || data.length === 0) {
          msg = [...data, ...currentData];
        }
        state.messageData[channelId] = {
          data: normalizeMessage(msg),
          loading: false,
          loadMore: false,
          loadMoreAfter: false,
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
        };
      });
  },
});

export const MESSAGE_ACTIONS = messageSlice.actions;

export default messageSlice.reducer;
