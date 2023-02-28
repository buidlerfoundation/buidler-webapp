import { getDeviceCode } from "renderer/common/Cookie";
import { MessageData } from "renderer/models";
import { getMentionData } from "../helpers/MessageHelper";
import Caller from "./Caller";

export const getPinPostMessage = async (
  postId: string,
  limit = 50,
  before = new Date().toISOString(),
  after?: string,
  controller?: AbortController
) => {
  const deviceCode = await getDeviceCode();
  let uri = `messages/${postId}/post?page[size]=${limit}&page[before]=${before}&device_code=${deviceCode}`;
  if (after) {
    uri += `&page[after]=${after}`;
  }
  return Caller.get<Array<MessageData>>(uri, undefined, controller);
};

export const deleteMessage = (messageId: string) =>
  Caller.delete(`message/${messageId}`);

export const getMessages = async (
  channelId: string,
  limit = 50,
  before?: string,
  after?: string,
  controller?: AbortController
) => {
  const deviceCode = await getDeviceCode();
  let uri = `messages/${channelId}?page[size]=${limit}&device_code=${deviceCode}`;
  if (after) {
    if (before) {
      uri += `&page[before]=${before}`;
    }
    uri += `&page[after]=${after}`;
  } else {
    uri += `&page[before]=${before || new Date().toISOString()}`;
  }
  return Caller.get<Array<MessageData>>(uri, undefined, controller);
};

export const getConversation = (
  parentId: string,
  limit = 20,
  before = new Date().toISOString()
) => {
  return Caller.get(
    `messages/conversation/${parentId}?page[size]=${limit}&page[before]=${before}`
  );
};

export const editMessage = (
  id: string,
  content: string,
  plain_text: string,
  file_ids?: Array<string>
) => {
  return Caller.put(`message/${id}`, {
    content,
    mentions: getMentionData(content),
    plain_text,
    file_ids,
  });
};

export const getAroundMessageById = async (messageId: string, limit = 20) => {
  const deviceCode = await getDeviceCode();
  return Caller.get<Array<MessageData>>(
    `messages/${messageId}/jump?device_code=${deviceCode}&limit=${limit}`
  );
};
