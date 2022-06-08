import ApiCaller from "./ApiCaller";

export const loginWithGoogle = (code: string) =>
  ApiCaller.post("user", { code });

export const findUser = async () => {
  return ApiCaller.get("user");
};

export const findTeam = () => ApiCaller.get("user/team");

export const getGroupChannel = (teamId: string) =>
  ApiCaller.get(`group/${teamId}`);

export const getSpaceChannel = (teamId: string) =>
  ApiCaller.get(`space/${teamId}`);

export const findChannel = (teamId: string) =>
  ApiCaller.get(`channel/${teamId}`);

export const getInitial = () => ApiCaller.get(`initial`);

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
  ApiCaller.post("user/address", { address });

export const verifyNonce = (nonce: string, signature: string) =>
  ApiCaller.post("user", { nonce, signature });

export const getCollectibles = (page = 1, limit = 10) => {
  return ApiCaller.get(`user/nft?page=${page}&limit=${limit}`);
};

export const updateUser = (data: any) => ApiCaller.put("user", data);

export const verifyOtp = (data: any) =>
  ApiCaller.post("user/device/verify", data);

export const syncChannelKey = (data: any) =>
  ApiCaller.post("user/device/sync", data);

export const acceptInvitation = (invitationId: string) =>
  ApiCaller.post(`team/invitation/${invitationId}/accept`);

export const removeDevice = (body: any) =>
  ApiCaller.delete("user/device", body);
