import {
  Channel,
  Community,
  CreatePostBody,
  IHNComment,
  IHNStory,
  IHNStoryComment,
  IHNStoryDetail,
  RequestPostList,
  Space,
} from "models/Community";
import Caller from "./Caller";
import { UserData } from "models/User";
import { ITopicComment, PostData } from "models/Message";

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

export const getCommunityDataFromChannel = (channelId: string) =>
  Caller.get<{ community: Community; space: Space | null; channel: Channel }>(
    `external/information?channel_id=${channelId}`
  );

export const joinChannel = (channelId: string) =>
  Caller.post(`channel/${channelId}/members`);

export const leaveChannel = (channelId: string) =>
  Caller.delete(`channel/${channelId}/members`);

export const getChannel = (channelId: string) =>
  Caller.get<Channel>(`channel/${channelId}`);

export const createPinPost = (createPostBody: CreatePostBody) =>
  Caller.post<PostData>("topic", createPostBody);

export const getListPost = (reqPostList: RequestPostList) => {
  const { channel_id, before_id, limit = 10 } = reqPostList;
  let uri = `channel/${channel_id}/topics?pagination[size]=${limit}`;
  if (before_id) {
    uri += `&pagination[before]=${before_id}`;
  }
  return Caller.get<PostData[]>(uri);
};

export const pinCommunity = (id: string) => Caller.post(`community/${id}/pin`);
export const unPinCommunity = (id: string) =>
  Caller.delete(`community/${id}/pin`);

export const getStories = (payload: { url: string; page?: number }) => {
  return Caller.get<IHNStory[]>(
    `external/hacker-new/story?${new URLSearchParams({
      url: payload.url,
      page: `${payload.page || 1}`,
    })}`
  );
};

export const getCommentFromStory = (payload: { id: string; page?: number }) =>
  Caller.get<IHNComment[]>(
    `external/hacker-new/story/${payload.id}/comments?page=${
      payload.page || 1
    }&limit=20`
  );

export const getStoryById = (id: string) =>
  Caller.get<IHNStoryDetail>(`external/hacker-new/story/${id}`);

export const getCommentsById = (id: number) =>
  Caller.get<IHNStoryComment[]>(`external/hacker-new/${id}/comments`);

export const getTopicById = (id: string) => Caller.get<PostData>(`topic/${id}`);

export const getTopicCommentsById = (req: {
  topicId: string;
  parentId?: string;
  rootParentId?: string;
}) =>
  Caller.get<ITopicComment[]>(
    `topic/${req.topicId}/comments?${new URLSearchParams({
      parent_id: req.parentId || "",
      root_parent_id: req.rootParentId || "",
    })}`
  );
