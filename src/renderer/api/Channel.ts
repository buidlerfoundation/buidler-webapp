import { Channel, ChannelKeyApiData, SpaceMember } from "renderer/models";
import { ConfigNotificationRequestBody } from "renderer/models/request";
import Caller from "./Caller";

export const createChannel = (teamId: string, body: any) =>
  Caller.post<Channel>(`channel/${teamId}`, body);

export const getChannels = (teamId: string) => Caller.get(`channel/${teamId}`);

export const updateChannel = (id: string, body: any) =>
  Caller.put(`channel/${id}`, body);

export const deleteChannel = (id: string) => Caller.delete(`channel/${id}`);

export const updateChannelNotification = (
  channelId: string,
  data: ConfigNotificationRequestBody
) => {
  return Caller.post(`channel/${channelId}/notification`, data);
};

export const addUserToChannel = (channelId: string, userId: string) =>
  Caller.post(`channel/${channelId}/member/${userId}`);

export const removeUserFromChannel = (channelId: string, userId: string) =>
  Caller.delete(`channel/${channelId}/member/${userId}`);

export const updateChannelMember = (channelId: string, body: any) =>
  Caller.put(`channel/${channelId}/member`, body);

export const createSpaceChannel = (teamId: string, body: any) =>
  Caller.post(`space/${teamId}`, body);

export const updateSpaceChannel = (spaceId: string, body: any) =>
  Caller.put(`space/${spaceId}`, body);

export const deleteSpaceChannel = (spaceId: string) =>
  Caller.delete(`space/${spaceId}`);

export const getSpaceMembers = (id: string, controller?: AbortController) =>
  Caller.get<Array<SpaceMember>>(`space/${id}/member`, undefined, controller);

export const getChannelFromSpace = (id: string) =>
  Caller.get<Array<Channel>>(`space/${id}/channel`);

export const createDirectChannel = (
  teamId: string,
  requestBody: any
) => {
  return Caller.post<Channel>(`channel/${teamId}`, requestBody);
};

export const getChannelKey = (timestamp?: string) =>
  Caller.get<ChannelKeyApiData[]>(`channel-key?timestamp=${timestamp || 0}`);
