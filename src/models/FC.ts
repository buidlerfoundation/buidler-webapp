import { Route } from "next";

export enum UserPermission {
  Rater = "rater",
  Writer = "writer",
}

export interface ISignedKeyRequest {
  token?: string;
  deeplinkUrl?: string;
  key?: string;
  requestFid?: number;
  state?: string;
  userFid?: number;
  signer_id?: string;
}

export interface ICommunityNoteInvitation {
  id: string;
  fid: string;
  status: "approved" | "requested";
  created_at: string;
  updated_at: string;
}

export interface IFCUser {
  user_id?: string;
  address?: string;
  email?: string;
  fid?: string;
  username?: string;
  display_name?: string;
  is_followed?: boolean;
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
  reaction_data?: {
    likes: number;
    recasts: number;
    replied_casts: number;
  };
  has_active_badge?: boolean;
  is_whitelisted?: boolean;
  community_note_invitation?: ICommunityNoteInvitation;
  permissions?: UserPermission[];
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
  parent_cast?: ICast;
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
  path: Route;
  value:
    | "trending"
    | "newest"
    | "by domain"
    | "most-commented"
    | "most-liked"
    | "helpful";
  title: string;
}

export interface IPagingData<T> {
  data: T[];
  total?: number;
  currentPage?: number;
  canMore?: boolean;
  loading?: boolean;
  loadMore?: boolean;
}

export interface IPagingDataOptional<T> {
  data?: T[];
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
  casts: IDataChart[];
}

export type ICommunityNotePath =
  | "/community-notes"
  | "/community-notes/new"
  | "/community-notes/nmr";

export type IUserTabPath =
  | "/non-follower"
  | "/following"
  | "/follower"
  | "/relation-mention"
  | "/relation-reply"
  | "/relation-reaction"
  | "/cast";

export interface IUserInsightTab<T> {
  path: T;
  label: string;
}

export interface IActiveBadgeCheck {
  has_display_name?: boolean;
  has_bio?: boolean;
  has_profile_picture?: boolean;
  verified_ethereum_address?: string;
  total_followers?: number;
  total_replied_casts?: number;
  total_reactions?: number;
  total_casts?: number;
  first_cast_created_at?: string;
}

export interface IFCChannel {
  channel_id: string;
  image: string;
  name: string;
  parent_url: string;
}

export interface IPastRelationData {
  first_interacted_at: string;
  likes: number;
  mentions: number;
  recasts: number;
  replied_casts: number;
}

export interface IPastRelationReactionData {
  created_at: string;
  fid: string;
  hash: string;
  reaction_type: 1 | 2;
  target_fid: string;
  target_hash: string;
  timestamp: string;
  updated_at: string;
  cast: ICast;
  user: IFCUser;
}
