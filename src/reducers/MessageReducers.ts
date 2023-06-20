import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logoutAction } from "./UserReducers";
import { normalizeMessage } from "helpers/MessageHelper";
import { GeneratedPrivateKey } from "common/Cookie";
import api from "api";
import { normalizePublicMessageData } from "helpers/ChannelHelper";
import { MessageData, PayloadMessageListAction } from "models/Message";

interface MessageState {
  messageData: {
    [key: string]: {
      canMore: boolean;
      data: MessageData[];
      canMoreAfter: boolean;
    };
  };
  apiController?: AbortController | null;
  highlightMessageId?: string;
  loadMoreAfterMessage?: boolean;
  loadMoreMessage?: boolean;
  loadingMessage?: boolean;
}

const initialState: MessageState = {
  messageData: {},
  apiController: null,
};

export const getMessages = createAsyncThunk(
  "message/get",
  async (payload: { channelId: string; before?: string; after?: string }) => {
    const { channelId, before, after } = payload;
    const privateKey = await GeneratedPrivateKey();
    const messageRes = await api.getMessages(
      channelId,
      undefined,
      before,
      after
    );
    if (messageRes.statusCode === 200) {
      const messageData = normalizePublicMessageData(
        messageRes.data,
        privateKey,
        messageRes.metadata?.encrypt_message_key
      );
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
    emitMessage: (state: MessageState, action: PayloadAction<MessageData>) => {
      const message = action.payload;
      if (
        message.entity_type === "channel" &&
        state.messageData?.[message.entity_id]
      ) {
        state.messageData[message.entity_id].data = normalizeMessage([
          message,
          ...state.messageData[message.entity_id].data,
        ]);
      }
    },
    newMessage: (state: MessageState, action: PayloadAction<MessageData>) => {
      const message = action.payload;
      if (
        message.entity_type === "channel" &&
        state.messageData?.[message.entity_id]
      ) {
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
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction, () => initialState)
      .addCase(getMessages.pending, (state, action) => {
        if (action.meta.arg.before) {
          state.loadMoreMessage = true;
        } else if (action.meta.arg.after) {
          state.loadMoreAfterMessage = true;
        } else {
          state.loadingMessage = true;
        }
      })
      .addCase(getMessages.rejected, (state, action) => {
        if (action.error.name !== 'AbortError') {
          state.loadMoreAfterMessage = false;
          state.loadingMessage = false;
          state.loadMoreAfterMessage = false;
        }
      })
      .addCase(getMessages.fulfilled, (state: MessageState, action: any) => {
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
        state.loadMoreAfterMessage = false;
        state.loadingMessage = false;
        state.loadMoreMessage = false;
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
      });
  },
});

export const MESSAGE_ACTIONS = messageSlice.actions;

export default messageSlice.reducer;