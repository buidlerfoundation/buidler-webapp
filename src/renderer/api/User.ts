import { DirectCommunity } from "renderer/common/AppConfig";
import {
  BalanceApiData,
  Channel,
  CollectibleDataApi,
  Community,
  Contract,
  ENSAsset,
  InitialApiData,
  NFTCollectionDataApi,
  NFTDetailDataApi,
  NotificationData,
  NotificationFilterType,
  Space,
  SpaceCollectionData,
  Token,
  TokenPrice,
  TransactionApiData,
  UserData,
  UserRoleType,
} from "renderer/models";
import { ConfigNotificationRequestBody } from "renderer/models/request";
import Caller from "./Caller";

export const loginWithGoogle = (code: string) => Caller.post("user", { code });

export const findUser = async () => {
  return Caller.get<UserData>("user");
};

export const findTeam = () =>
  Caller.get<Community[]>("user/team?include_direct=1");

export const getGroupChannel = (teamId: string) =>
  Caller.get(`group/${teamId}`);

export const getSpaceChannel = (teamId: string, controller?: AbortController) =>
  Caller.get<Array<Space>>(`space/${teamId}`, undefined, controller);

export const findDirectChannel = (
  status?: "pending" | "blocked" | "accepted",
  controller?: AbortController
) => {
  let uri =
    "direct-channel?channel_types[]=Direct&channel_types[]=Multiple Direct&status=accepted";
  // if (status) {
  //   uri += `&status=${status}`;
  // }
  return Caller.get<Array<Channel>>(uri, undefined, controller);
};

export const findChannel = (teamId: string, controller?: AbortController) => {
  if (teamId === DirectCommunity.team_id)
    return findDirectChannel(undefined, controller);
  return Caller.get<Array<Channel>>(`channel/${teamId}`, undefined, controller);
};

export const getInitial = () => Caller.get<InitialApiData>(`initial`);

export const updateChannel = (id: string, data: any) =>
  Caller.put(`channel/${id}`, data);

export const removeTeamMember = (teamId: string, userId: string) =>
  Caller.delete(`team/${teamId}/member`, { user_ids: [userId] });

export const leaveTeam = (teamId: string) =>
  Caller.delete(`team/${teamId}/leave`);

export const updateUserChannel = (channelIds: Array<string>) =>
  Caller.put(`user/channel`, { channel_ids: channelIds });

export const requestNonce = (pubKey: string) =>
  Caller.post("user/nonce", { public_key: pubKey });

export const requestNonceWithAddress = (address: string) =>
  Caller.post<{ message: string }>("user/address", { address });

export const verifyNonce = (message: string, signature: string) =>
  Caller.post<{
    avatar_url: string;
    user_id: string;
    user_name: string;
  }>("user", { message, signature });

export const getCollectibles = (page = 1, limit = 10) => {
  return Caller.get<CollectibleDataApi>(`user/nft?page=${page}&limit=${limit}`);
};

export const updateUser = (data: any) => Caller.put("user", data);

export const verifyOtp = (data: any) => Caller.post("user/device/verify", data);

export const syncChannelKey = (data: any) =>
  Caller.post("user/device/sync", data);

export const acceptInvitation = (invitationId: string, ref?: string | null) =>
  Caller.post<Community>(
    `team/invitation/${invitationId}/accept`,
    undefined,
    undefined,
    undefined,
    ref ? { ref } : undefined
  );

export const removeDevice = (body: any) => Caller.delete("user/device", body);

export const getNFTCollection = () =>
  Caller.get<Array<NFTCollectionDataApi>>("user/nft-collection");

export const getSpaceCondition = (spaceId: string) =>
  Caller.get<Array<SpaceCollectionData>>(`space/${spaceId}/condition`);

export const fetchWalletBalance = () =>
  Caller.get<BalanceApiData>("user/balance");

export const fetchTransaction = (params: { page?: number; limit?: number }) => {
  const { page = 1, limit = 20 } = params;
  return Caller.get<Array<TransactionApiData>>(
    `user/transaction?page=${page}&limit=${limit}`
  );
};

export const fetchNFTCollection = () =>
  Caller.get<{ nft_assets: NFTCollectionDataApi[]; ens_assets: ENSAsset[] }>(
    "user/nft-collection/group"
  );

export const getUserDetail = (
  userId: string,
  teamId: string,
  withoutError?: boolean
) =>
  Caller.get<UserData>(
    `user/${userId}/team/${teamId}`,
    undefined,
    undefined,
    withoutError
  );

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

export const getGasLimit = (tx) =>
  Caller.post<number>("price/estimate/gas", tx);

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

export const addPendingTx = (tx: TransactionApiData) =>
  Caller.post<TransactionApiData>("user/transaction", tx);

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

export const getNotification = (
  filterType: NotificationFilterType,
  before?: string
) => {
  let uri = "notifications?page[size]=20";
  if (filterType === "Mention") {
    uri +=
      "&notification_types[]=channel_mention&notification_types[]=post_mention";
  } else if (filterType === "Unread") {
    uri += "&is_read=false";
  }
  if (before) {
    uri += `&page[before]=${before}`;
  }
  return Caller.get<NotificationData[]>(uri);
};

export const readNotification = (notificationId: string) =>
  Caller.put(`notifications/${notificationId}`);

export const readAllNotification = () => Caller.put("notifications");

export const deleteNotification = (notificationId: string) =>
  Caller.delete(`notifications/${notificationId}`);

export const configNotificationFromTask = (
  pinPostId: string,
  data: ConfigNotificationRequestBody
) => Caller.post(`notifications/task/${pinPostId}`, data);

export const getNFTsDetails = (
  contractAddresses: string[],
  tokenIds: string[],
  networks: string[]
) => {
  let uri = "user/nft?";
  contractAddresses.forEach(
    (address) => (uri += `contract_addresses[]=${address}&`)
  );
  tokenIds.forEach((id) => (uri += `token_ids[]=${id}&`));
  networks.forEach((network) => (uri += `networks[]=${network}&`));
  return Caller.get<NFTDetailDataApi[]>(uri);
};

export const requestOTT = () => Caller.get<string>("authentication/ott");

export const generateTokenFromOTT = (ott: string) =>
  Caller.get<{
    token: string;
    token_expire_at: number;
    refresh_token: string;
    refresh_token_expire_at: number;
  }>(`authentication/ott/${ott}`);
