export interface ISignedKeyRequest {
  token?: string;
  deeplinkUrl?: string;
  key?: string;
  requestFid?: number;
  state?: string;
  userFid?: number;
  signer_id?: string;
}

export interface IFCUser {
  fid: number;
  username?: string;
  display_name?: string;
  pfp: {
    url?: string;
  };
  profile: {
    bio: {
      text?: string;
      mentions?: [];
    };
    location: {
      placeId?: string;
      description?: string;
    };
  };
  followerCount?: number;
  followingCount?: number;
  activeOnFcNetwork?: boolean;
  viewerContext?: {
    following?: boolean;
    followedBy?: boolean;
    canSendDirectCasts?: boolean;
    hasUploadedInboxKeys?: boolean;
  };
}
