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
  fid: string;
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

export interface ICast {
  id: string;
  hash: string;
  fid: string;
  author?: IFCUser;
  text: string;
  is_liked: boolean;
  is_recast: boolean;
  parent_hash?: string;
  parent_fid?: string;
  parent_url?: string;
  embeds?: {
    url: string;
  }[];
  mentions: IFCUser[];
  mentions_positions: number[];
  timestamp: string;
  reactions?: {
    count?: number;
  };
  recasts?: {
    count?: number;
    recasters?: IFCUser[];
  };
  replies?: {
    count?: number;
    casts?: ICast[];
  };
  metadata?: IMetadataUrl;
  created_at: string;
  total_casts: number;
}

export interface IMetadataUrl {
  image?: string;
  title?: string;
  card?: string;
  description?: string;
  logo?: string;
  url?: string;
  site_name?: string;
}

export interface IFCFilterType {
  label: string;
  id: string;
  path: string;
  value: "trending" | "newest" | "by domain" | "most-commented";
  title: string;
}

export interface IFeedData {
  data: ICast[];
  total?: number;
  currentPage?: number;
  canMore?: boolean;
  loading?: boolean;
  loadMore?: boolean;
}
