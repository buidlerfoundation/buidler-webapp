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
  team_display_name: string;
  team_icon?: string;
  team_id: string;
  team_url?: string;
  role?: string;
  team_description?: string;
  seen?: boolean;
  is_verified?: boolean;
  direct?: boolean;
  team_background?: string;
  ens?: string;
  total_members?: number;
  total_online_members?: number;
}

export interface Space {
  is_hidden?: boolean;
  order: number;
  space_emoji?: string;
  space_id: string;
  space_image_url?: string;
  space_name: string;
  space_type: "Public" | "Private";
  team_id?: string;
  space_description?: string;
  icon_color?: string;
  icon_sub_color?: string;
  attachment?: LocalAttachment;
  space_background_color?: string;
  channel_ids: Array<string>;
  is_space_member: boolean;
}

export interface Channel {
  channel_emoji?: string;
  channel_id: string;
  channel_image_url?: string;
  channel_members?: Array<string>;
  channel_name: string;
  channel_type: "Public" | "Private" | "Direct";
  notification_type?: string;
  seen?: boolean;
  space?: Space;
  space_id?: string;
  user?: UserData;
  group_channel_id?: string;
  attachment?: any;
  is_chat_deactivated?: boolean;
  updatedAt?: string;
  team_id?: string;
  dapp_integration_url?: string;
  is_dapp_extension_required?: boolean;
  firstItem?: boolean;
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
