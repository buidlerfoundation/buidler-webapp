import { Channel, Community, CreatePostBody, Space } from "models/Community";
import Caller from "./Caller";
import { UserData } from "models/User";
import { PostData } from "models/Message";

export const createCommunity = (body: any) =>
  Caller.post<Community>("community", body);

export const getListChannel = (communityId: string) =>
  Caller.get<Space[]>(`channel?community_id=${communityId}`);

export const getTeamUsers = (
  communityId: string,
  controller?: AbortController
) => {
  return Caller.get<UserData[]>(
    `community/${communityId}/members`,
    undefined,
    controller
  );
};

export const getCommunityDataFromUrl = (url: string) =>
  Caller.get<{ community: Community; space: Space | null; channel: Channel }>(
    `external?url=${url}`
  );

export const joinChannel = (channelId: string) =>
  Caller.post(`channel/${channelId}/members`);

export const getChannel = (channelId: string) =>
  Caller.get<Channel>(`channel/${channelId}`);

export const createPinPost = (createPostBody: CreatePostBody) =>
  Caller.post<PostData>("post", createPostBody);

export const getListPost = (channelId: string) =>
  Caller.get<PostData[]>(`channel/${channelId}/posts`);
