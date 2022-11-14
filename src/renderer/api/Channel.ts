import { Channel, SpaceMember } from "renderer/models";
import { ConfigNotificationRequestBody } from "renderer/models/request";
import ApiCaller from "./ApiCaller";
import Caller from "./Caller";

export const createChannel = (teamId: string, body: any) =>
  Caller.post<Channel>(`channel/${teamId}`, body);

export const getChannels = (teamId: string) =>
  ApiCaller.get(`channel/${teamId}`);

export const updateChannel = (id: string, body: any) =>
  ApiCaller.put(`channel/${id}`, body);

export const deleteChannel = (id: string) => ApiCaller.delete(`channel/${id}`);

export const updateChannelNotification = (
  channelId: string,
  data: ConfigNotificationRequestBody
) => {
  return ApiCaller.post(`channel/${channelId}/notification`, data);
};

export const addUserToChannel = (channelId: string, userId: string) =>
  ApiCaller.post(`channel/${channelId}/member/${userId}`);

export const removeUserFromChannel = (channelId: string, userId: string) =>
  ApiCaller.delete(`channel/${channelId}/member/${userId}`);

export const updateChannelMember = (channelId: string, body: any) =>
  ApiCaller.put(`channel/${channelId}/member`, body);

export const createSpaceChannel = (teamId: string, body: any) =>
  ApiCaller.post(`space/${teamId}`, body);

export const updateSpaceChannel = (spaceId: string, body: any) =>
  ApiCaller.put(`space/${spaceId}`, body);

export const deleteSpaceChannel = (spaceId: string) =>
  ApiCaller.delete(`space/${spaceId}`);

export const getSpaceMembers = (id: string, controller?: AbortController) =>
  Caller.get<Array<SpaceMember>>(`space/${id}/member`, undefined, controller);

export const getChannelFromSpace = (id: string) =>
  Caller.get<Array<Channel>>(`space/${id}/channel`);
