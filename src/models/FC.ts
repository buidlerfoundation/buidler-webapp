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
  total_cast?: number;
  total_follower?: number;
  total_following?: number;
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
  value: "trending" | "newest" | "by domain" | "most-commented" | "most-liked";
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

export type ActivityPeriod = "1d" | "7d" | "14d" | "30d" | "90d";

export interface IActivity {
  total: number;
  changed: number;
}
export interface IFCUserActivity {
  cast: IActivity;
  follower: IActivity;
  following: IActivity;
  replied_cast: IActivity;
}

export interface IActivityFilter {
  label: string;
  period: ActivityPeriod;
}

export interface IDataChart {
  formatted_time: string;
  timestamp: number;
  value: number;
}

export interface IDataUserEngagement {
  likes: IDataChart[];
  recasts: IDataChart[];
}
