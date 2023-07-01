import { UserData } from "./User";

export type LocalAttachment = {
  file?: any;
  loading?: boolean;
  type?: string;
  fileName?: string;
  id?: string;
  randomId?: string;
  url?: string;
  attachmentId?: string;
};

export interface Community {
  community_background?: string;
  community_description?: string;
  community_id: string;
  community_image?: string;
  community_name?: string;
  community_url?: string;
  created_at?: string;
  default_channel_id?: string;
  notification_type?: string;
  updated_at?: string;
  seen?: boolean;
  role?: string;
  is_verified?: boolean;
  direct?: boolean;
  ens?: string;
  total_members?: number;
  total_online_members?: number;
  total_community_members?: number;
}

export interface Channel {
  channel_url?: string;
  channel_description?: string;
  created_at?: string;
  updated_at?: string;
  channel_emoji?: string;
  channel_id: string;
  channel_image?: string;
  channel_members?: Array<string>;
  channel_name: string;
  channel_type: "public" | "private" | "direct" | "global";
  notification_type?: string;
  seen?: boolean;
  space_id: string;
  is_chat_deactivated?: boolean;
  community_id?: string;
  dapp_integration_url?: string;
  is_dapp_extension_required?: boolean;
  attachment?: LocalAttachment;
  firstItem?: boolean;
  is_channel_member?: boolean;
  total_channel_members?: number;
  total_channel_messages?: number;
  display_channel_url?: string;
}

export interface Space {
  is_hidden?: boolean;
  order?: number;
  space_emoji?: string;
  space_id: string;
  space_name: string;
  community_id?: string;
  space_description?: string;
  icon_color?: string;
  icon_sub_color?: string;
  attachment?: LocalAttachment;
  is_space_member?: boolean;
  space_url?: string;
  space_image?: string;
  space_background?: string;
  notification_type?: string;
  created_at?: string;
  updated_at?: string;
  channels?: Channel[];
  display_space_url?: string;
}

export type CreateChannelData = {
  name: string;
  space?: Space | null;
  isPrivate?: boolean;
  members?: Array<UserData>;
  channelId?: string;
  attachment?: LocalAttachment | null;
  emoji?: string | null;
  url?: string | null;
  isDeactivated?: boolean;
  notificationType?: string;
  dAppUrl?: string;
  isActiveDApp?: boolean;
};

export interface CreatePostBody {
  content?: string;
  post_id?: string;
  channel_ids?: string[];
}

export interface RequestPostList {
  channel_id: string;
  before_id?: string;
  limit?: string;
}
