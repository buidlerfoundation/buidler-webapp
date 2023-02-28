import { ReactUserApiData } from 'renderer/models';
import Caller from './Caller';

export const addReaction = (
  taskId: string,
  data: { emoji_id: string; skin: number }
) => Caller.post(`reaction/${taskId}`, data);

export const removeReaction = (taskId: string, data: { emoji_id: string }) =>
  Caller.delete(`reaction/${taskId}`, data);

export const getReactionDetail = (id: string, emojiId: string) =>
  Caller.post<Array<ReactUserApiData>>(`reaction/${id}/users`, {
    emoji_id: emojiId,
  });
