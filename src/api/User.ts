import {
  BalanceApiData,
  Contract,
  InitialApiData,
  ProfileApiData,
  Token,
  TokenPrice,
  UserData,
  UserRoleType,
} from "models/User";
import Caller from "./Caller";
import { Channel, Community, Space } from "models/Community";
import { DirectCommunity } from "common/AppConfig";

export const getInitial = () => Caller.get<InitialApiData>(`initial`);

export const findUser = async () => {
  return Caller.get<UserData>("user");
};

export const fetchWalletBalance = () =>
  Caller.get<BalanceApiData>("user/balance");

export const findTeam = () =>
  Caller.get<Community[]>("user/team?include_direct=1");

export const getSpaceChannel = (teamId: string, controller?: AbortController) =>
  Caller.get<Space[]>(`space/${teamId}`, undefined, controller);

export const findDirectChannel = (
  status?: "pending" | "blocked" | "accepted",
  controller?: AbortController
) => {
  let uri =
    "direct-channel?channel_types[]=Direct&channel_types[]=Multiple Direct&status=accepted";
  // if (status) {
  //   uri += `&status=${status}`;
  // }
  return Caller.get<Channel[]>(uri, undefined, controller);
};

export const findChannel = (teamId: string, controller?: AbortController) => {
  if (teamId === DirectCommunity.team_id)
    return findDirectChannel(undefined, controller);
  return Caller.get<Channel[]>(`channel/${teamId}`, undefined, controller);
};

export const refreshToken = (token: string) => {
  return Caller.post<{
    token: string;
    token_expire_at: number;
    refresh_token: string;
    refresh_token_expire_at: number;
  }>("user/refresh", undefined, undefined, undefined, {
    "Refresh-Token": token,
  });
};

export const generateTokenFromOTT = (ott: string) =>
  Caller.get<{
    token: string;
    token_expire_at: number;
    refresh_token: string;
    refresh_token_expire_at: number;
  }>(`authentication/ott/${ott}`);

export const verifyNonce = (data: any, signature: string) =>
  Caller.post<{
    avatar_url: string;
    user_id: string;
    user_name: string;
  }>("user", { data, signature });

export const acceptInvitation = (invitationId: string, ref?: string | null) =>
  Caller.post<Community>(
    `team/invitation/${invitationId}/accept`,
    undefined,
    undefined,
    undefined,
    ref ? { ref } : undefined
  );

export const getDirectChannelUsers = (controller?: AbortController) =>
  Caller.get<UserData[]>(
    "direct-channel/members?channel_types[]=Direct&channel_types[]=Multiple Direct",
    undefined,
    controller
  );

export const getTeamUsers = (teamId: string, controller?: AbortController) => {
  if (teamId === DirectCommunity.team_id)
    return getDirectChannelUsers(controller);
  return Caller.get<UserData[]>(
    `team/${teamId}/members`,
    undefined,
    controller
  );
};

export const importToken = (address: string) =>
  Caller.post<Token>(`user/balance/${address}`);

export const searchToken = (address: string) =>
  Caller.get<Contract[]>(`contract/${address}`);

export const findUserByAddress = (params: {
  address?: string;
  username?: string;
}) => {
  let url = "user/search";
  if (params.address) {
    url += `?address=${params.address}`;
  } else if (params.username) {
    url += `?username=${params.username}`;
  }
  return Caller.get<Array<UserData>>(url);
};

export const getTokenPrice = (contractAddress: string) =>
  Caller.get<TokenPrice>(`price/${contractAddress}`);

export const getGasPrice = () => Caller.get<number>("price/gas");

export const getGasLimit = (tx: any) =>
  Caller.post<number>("price/estimate/gas", tx);

export const updateUser = (data: any) => Caller.put("user", data);

export const removeDevice = (body: any) => {
  return Caller.delete("user/device", body);
};

export const getProfile = (name: string) =>
  Caller.get<ProfileApiData>(`profiles/${name}/extensions`);

export const invitation = (teamId: string) =>
  Caller.post<{ invitation_url: string }>(`team/invitation/${teamId}/members`);

export const getMembersByRole = (
  teamId: string,
  roles: Array<UserRoleType> = [],
  params: {
    userName?: string;
    page?: number;
  } = {}
) => {
  const { userName, page } = params;
  let url = `team/${teamId}/role?page=${page || 1}&limit=100`;
  roles.forEach((el) => {
    url += `&roles[]=${el}`;
  });
  if (userName) {
    url += `&username=${userName}`;
  }
  return Caller.get<Array<UserData>>(url);
};

export const modifyRole = (
  teamId: string,
  role: string,
  body: { user_ids_to_add?: Array<string>; user_ids_to_remove?: Array<string> }
) => {
  return Caller.put(`team/${teamId}/${role}`, body);
};