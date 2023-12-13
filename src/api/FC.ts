import {
  ActivityPeriod,
  IActiveBadgeCheck,
  ICast,
  IDataUserEngagement,
  IFCChannel,
  IFCUser,
  IFCUserActivity,
  IMetadataUrl,
  IPastRelationData,
  IPastRelationReactionData,
  ISignedKeyRequest,
} from "models/FC";
import Caller from "./Caller";

export const requestSignedKey = () => Caller.post<ISignedKeyRequest>("signers");

export const checkRequestToken = (token: string) =>
  Caller.get<ISignedKeyRequest>(`signers?token=${token}`);

export const pollingSignedKey = async (
  token: string,
  controller?: AbortController
) => {
  while (true) {
    await new Promise((r) => setTimeout(r, 4000));
    const res = await Caller.get<ISignedKeyRequest>(
      `signers?token=${token}`,
      undefined,
      controller
    );
    if (res.data?.state === "completed") {
      return res;
    }
    if (res.message?.includes("aborted")) {
      break;
    }
  }
};

export const getCurrentFCUser = () => Caller.get<IFCUser>("users/me");

export const getFCUser = (username: string) =>
  Caller.get<IFCUser>(`users/${username}`);

export const getFCUserByUserName = (username: string) =>
  Caller.get<IFCUser>(
    `users/user-by-username?${new URLSearchParams({ username })}`
  );

export const cast = (data: any) => Caller.post<string>("casts", data);

export const listCasts = (params: {
  text: string;
  page: number;
  limit: number;
}) =>
  Caller.get<ICast[]>(
    `casts?${new URLSearchParams({
      url: params.text,
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const getCastDetail = (params: {
  hash: string;
  page: number;
  limit: number;
  cast_author_fid?: string;
}) => {
  const query = new URLSearchParams({
    page: `${params.page}`,
    limit: `${params.limit}`,
  });
  let hash = params.hash;
  if (params.cast_author_fid) {
    query.append("cast_author_fid", params.cast_author_fid);
  }
  if (hash.slice(0, 2) === "0x") {
    hash = hash.slice(2);
  }
  return Caller.get<ICast>(
    `casts/${hash}?${query}`,
    undefined,
    undefined,
    true
  );
};

export const deleteCast = (hash: string) => Caller.delete(`casts/${hash}`);

export const recast = (hash: string) => Caller.post(`reactions/${hash}/recast`);

export const like = (hash: string) => Caller.post(`reactions/${hash}/like`);

export const removeRecast = (hash: string) =>
  Caller.delete(`reactions/${hash}/recast`);

export const removeLike = (hash: string) =>
  Caller.delete(`reactions/${hash}/like`);

export const getEmbeddedMetadata = (url: string) =>
  Caller.get<IMetadataUrl>(
    `external/metadata?${new URLSearchParams({ url })}`,
    undefined,
    undefined,
    true
  );

export const getHomeFeed = (params: {
  type: string;
  page: number;
  limit: number;
}) =>
  Caller.get<ICast[]>(
    `home/?${new URLSearchParams({
      type: params.type,
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const upload = (file?: any) => {
  const data = new FormData();
  data.append("file", file);
  return Caller.post<string>(`attachments`, data);
};

export const getFCUsersByName = (name: string) => {
  return Caller.get<IFCUser[]>(
    `users?${new URLSearchParams({ username: name, limit: "20" })}`
  );
};

export const getUserActivities = (params: {
  username: string;
  type: ActivityPeriod;
}) =>
  Caller.get<IFCUserActivity>(
    `users/${params.username}/activities?type=${params.type}`
  );

export const getUserDataEngagement = (name: string) =>
  Caller.get<IDataUserEngagement>(`users/${name}/data/engagement`);

export const getUserDataActivities = (name: string) =>
  Caller.get<IDataUserEngagement>(`users/${name}/data/activities`);

export const getNonFollowerUsers = (params: {
  username: string;
  page: number;
  limit: number;
}) =>
  Caller.get<IFCUser[]>(
    `users/${params.username}/non-followers?${new URLSearchParams({
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const getFollowerUsers = (params: {
  username: string;
  page: number;
  limit: number;
}) =>
  Caller.get<IFCUser[]>(
    `links/${params.username}/followers?${new URLSearchParams({
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const getFollowingUsers = (params: {
  username: string;
  page: number;
  limit: number;
}) =>
  Caller.get<IFCUser[]>(
    `links/${params.username}/following?${new URLSearchParams({
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const getTopInteractions = (params: {
  username: string;
  page: number;
  limit: number;
}) =>
  Caller.get<IFCUser[]>(
    `users/${params.username}/top-reaction?${new URLSearchParams({
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const followUser = (name: string) => Caller.post(`links/${name}/follow`);

export const unfollowUser = (name: string) =>
  Caller.delete(`links/${name}/follow`);

export const getActiveBadgeCheck = (name: string) =>
  Caller.get<IActiveBadgeCheck>(`users/${name}/active-badge`);

export const getChannels = () => Caller.get<IFCChannel[]>("channels?limit=50");

export const getPastRelation = (fid: string) =>
  Caller.get<IPastRelationData>(`users/${fid}/past-relation/sum`);

export const getPastRelationCast = (params: {
  fid: string;
  type: "mention" | "reply";
  page: number;
  limit: number;
}) =>
  Caller.get<ICast[]>(
    `users/${params.fid}/past-relation/casts?type=${params.type}&page=${params.page}&limit=${params.limit}`
  );

export const getPastRelationReaction = (params: {
  fid: string;
  page: number;
  limit: number;
}) =>
  Caller.get<IPastRelationReactionData[]>(
    `users/${params.fid}/past-relation/reactions?page=${params.page}&limit=${params.limit}`
  );
