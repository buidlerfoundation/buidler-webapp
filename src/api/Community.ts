import { Channel, Community, Space } from "models/Community";
import Caller from "./Caller";
import { UserData } from "models/User";

export const createCommunity = (body: any) =>
  Caller.post<Community>("community", body);

export const getListChannel = (communityId: string) =>
  Caller.get<Space[]>(
    `channel?community_id=${communityId}`
  );

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
