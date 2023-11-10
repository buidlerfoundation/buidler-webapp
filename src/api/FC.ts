import { ICast, IFCUser, IMetadataUrl, ISignedKeyRequest } from "models/FC";
import Caller from "./Caller";

export const requestSignedKey = () =>
  Caller.post<ISignedKeyRequest>("xcaster/signers");

export const pollingSignedKey = async (
  token: string,
  controller?: AbortController
) => {
  while (true) {
    await new Promise((r) => setTimeout(r, 4000));
    const res = await Caller.get<ISignedKeyRequest>(
      `xcaster/signers?token=${token}`,
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

export const getCurrentFCUser = () => Caller.get<IFCUser>("xcaster/users/me");

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
  if (params.cast_author_fid) {
    query.append("cast_author_fid", params.cast_author_fid);
  }
  return Caller.get<ICast>(`casts/${params.hash}?${query}`);
};

export const deleteCast = (hash: string) => Caller.delete(`casts/${hash}`);

export const recast = (hash: string) =>
  Caller.post(`xcaster/reactions/${hash}/recast`);

export const like = (hash: string) =>
  Caller.post(`xcaster/reactions/${hash}/like`);

export const removeRecast = (hash: string) =>
  Caller.delete(`xcaster/reactions/${hash}/recast`);

export const removeLike = (hash: string) =>
  Caller.delete(`xcaster/reactions/${hash}/like`);

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
