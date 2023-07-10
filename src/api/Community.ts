import {
  Channel,
  Community,
  CreatePostBody,
  IHNComment,
  IHNStory,
  RequestPostList,
  Space,
} from "models/Community";
import Caller from "./Caller";
import { UserData } from "models/User";
import { PostData } from "models/Message";

export const getPinnedCommunities = () =>
  Caller.get<Community[]>("community?type=pin");

export const getCommunities = () => Caller.get<Community[]>("community");

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
  Caller.post<{ community: Community; space: Space | null; channel: Channel }>(
    "external",
    { url }
  );

export const joinChannel = (channelId: string) =>
  Caller.post(`channel/${channelId}/members`);

export const getChannel = (channelId: string) =>
  Caller.get<Channel>(`channel/${channelId}`);

export const createPinPost = (createPostBody: CreatePostBody) =>
  Caller.post<PostData>("post", createPostBody);

export const getListPost = (reqPostList: RequestPostList) => {
  const { channel_id, before_id, limit = 10 } = reqPostList;
  let uri = `channel/${channel_id}/posts?pagination[size]=${limit}`;
  if (before_id) {
    uri += `&pagination[before]=${before_id}`;
  }
  return Caller.get<PostData[]>(uri);
};

export const pinCommunity = (id: string) => Caller.post(`community/${id}/pin`);
export const unPinCommunity = (id: string) =>
  Caller.delete(`community/${id}/pin`);

export const getStories = (payload: { url: string; page?: number }) =>
  Caller.post<IHNStory[]>(
    `external/hacker-new/story?page=${payload.page || 1}&limit=10`,
    { url: payload.url }
  );

export const getCommentFromStory = (payload: { id: string; page?: number }) =>
  Caller.get<IHNComment[]>(
    `external/hacker-new/story/${payload.id}/comments?page=${
      payload.page || 1
    }&limit=20`
  );

export const getStoryById = (id: string) =>
  Caller.get<IHNStory>(`external/story/${id}`);
