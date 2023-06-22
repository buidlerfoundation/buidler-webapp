import { Channel, Community, Space } from "models/Community";
import Caller from "./Caller";
import { UserData } from "models/User";

export const createCommunity = (body: any) =>
  Caller.post<Community>("community", body);

export const getListChannel = (communityId: string) =>
  Caller.get<{ spaces: Space[]; global_channels: Channel[] }>(
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
