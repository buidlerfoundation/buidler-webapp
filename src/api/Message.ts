import { getDeviceCode } from "common/Cookie";
import { getMentionData } from "../helpers/MessageHelper";
import Caller from "./Caller";
import { MessageData } from "models/Message";

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
  let uri = `channel/${channelId}/messages?pagination[size]=${limit}`;
  if (after) {
    if (before) {
      uri += `&pagination[before]=${before}`;
    }
    uri += `&pagination[after]=${after}`;
  } else {
    uri += `&pagination[before]=${before || new Date().toISOString()}`;
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
  return Caller.get<Array<MessageData>>(
    `message/${messageId}/jump?pagination[size]=${limit}`
  );
};

export const upVoteScamMessage = (id: string) =>
  Caller.post(`scam-alert/${id}/upvote`);

export const downVoteScamMessage = (id: string) =>
  Caller.post(`scam-alert/${id}/downvote`);

export const createComment = (req: {
  topicId: string;
  parentId?: string;
  content: string;
  rootParentId?: string;
}) =>
  Caller.post(`topic/${req.topicId}/comments`, {
    content: req.content,
    parent_id: req.parentId,
    root_parent_id: req.rootParentId,
  });
