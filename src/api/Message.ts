import { getMentionData } from '../helpers/MessageHelper';
import ApiCaller from './ApiCaller';

export const deleteMessage = (messageId: string) =>
  ApiCaller.delete(`message/${messageId}`);

export const getMessages = (
  channelId: string,
  limit = 50,
  before = new Date().toISOString(),
  after?: string
) => {
  let uri = `messages/${channelId}?page[size]=${limit}&page[before]=${before}`;
  if (after) {
    uri += `&page[after]=${after}`;
  }
  return ApiCaller.get(uri);
};

export const getConversation = (
  parentId: string,
  limit = 20,
  before = new Date().toISOString()
) => {
  return ApiCaller.get(
    `messages/conversation/${parentId}?page[size]=${limit}&page[before]=${before}`
  );
};

export const editMessage = (
  id: string,
  content: string,
  plain_text: string,
  file_ids?: Array<string>
) => {
  return ApiCaller.put(`message/${id}`, {
    content,
    mentions: getMentionData(content),
    plain_text,
    file_ids,
  });
};
