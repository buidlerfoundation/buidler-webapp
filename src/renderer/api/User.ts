import {
  BalanceApiData,
  Channel,
  CollectibleDataApi,
  Community,
  Contract,
  InitialApiData,
  NFTCollectionDataApi,
  Space,
  SpaceCollectionData,
  Token,
  TokenPrice,
  TransactionApiData,
  UserData,
  UserNFTCollection,
} from "renderer/models";
import ApiCaller from "./ApiCaller";
import Caller from "./Caller";

export const loginWithGoogle = (code: string) =>
  ApiCaller.post("user", { code });

export const findUser = async () => {
  return Caller.get<UserData>("user");
};

export const findTeam = () => Caller.get<Array<Community>>("user/team");

export const getGroupChannel = (teamId: string) =>
  ApiCaller.get(`group/${teamId}`);

export const getSpaceChannel = (teamId: string) =>
  Caller.get<Array<Space>>(`space/${teamId}`);

export const findChannel = (teamId: string) =>
  Caller.get<Array<Channel>>(`channel/${teamId}`);

export const getInitial = () => Caller.get<InitialApiData>(`initial`);

export const updateChannel = (id: string, data: any) =>
  ApiCaller.put(`channel/${id}`, data);

export const removeTeamMember = (teamId: string, userId: string) =>
  ApiCaller.delete(`team/${teamId}/member/${userId}`);

export const leaveTeam = (teamId: string) =>
  ApiCaller.delete(`team/${teamId}/leave`);

export const updateUserChannel = (channelIds: Array<string>) =>
  ApiCaller.put(`user/channel`, { channel_ids: channelIds });

export const requestNonce = (pubKey: string) =>
  ApiCaller.post("user/nonce", { public_key: pubKey });

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

export const updateUser = (data: any) => ApiCaller.put("user", data);

export const verifyOtp = (data: any) =>
  ApiCaller.post("user/device/verify", data);

export const syncChannelKey = (data: any) =>
  ApiCaller.post("user/device/sync", data);

export const acceptInvitation = (invitationId: string) =>
  Caller.post<{ team_id: string }>(`team/invitation/${invitationId}/accept`);

export const removeDevice = (body: any) =>
  ApiCaller.delete("user/device", body);

export const getNFTCollection = () =>
  ApiCaller.get<Array<UserNFTCollection>>("user/nft-collection");

export const getSpaceCondition = (spaceId: string) =>
  Caller.get<Array<SpaceCollectionData>>(`space/${spaceId}/condition`);

export const fetchWalletBalance = () =>
  Caller.get<BalanceApiData>("user/balance");

export const fetchTransaction = (params: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = params;
  return Caller.get<Array<TransactionApiData>>(
    `user/transaction?page=${page}&limit=${limit}`
  );
};

export const fetchNFTCollection = () =>
  Caller.get<Array<NFTCollectionDataApi>>("user/nft-collection/group");

export const getUserDetail = (userId: string, teamId: string) =>
  Caller.get<UserData>(`user/${userId}/team/${teamId}`);

export const importToken = (address: string) =>
  Caller.post<Token>(`user/balance/${address}`);

export const searchToken = (address: string) =>
  Caller.get<Contract>(`contract/${address}`);

export const findUserByAddress = (address: string) =>
  Caller.get<UserData>(`user/search?address=${address}`);

export const getTokenPrice = (contractAddress: string) =>
  Caller.get<TokenPrice>(`price/${contractAddress}`);

export const getGasPrice = () => Caller.get<number>("price/gas");
