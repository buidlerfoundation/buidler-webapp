import { ReactUserApiData } from 'renderer/models';
import ApiCaller from './ApiCaller';
import Caller from './Caller';

export const addReaction = (
  taskId: string,
  data: { emoji_id: string; skin: number }
) => ApiCaller.post(`reaction/${taskId}`, data);

export const removeReaction = (taskId: string, data: { emoji_id: string }) =>
  ApiCaller.delete(`reaction/${taskId}`, data);

export const getReactionDetail = (id: string, emojiId: string) =>
  Caller.post<Array<ReactUserApiData>>(`reaction/${id}/users`, {
    emoji_id: emojiId,
  });
