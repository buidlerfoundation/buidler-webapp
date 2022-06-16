export type LocalAttachment = {
  file?: any;
  loading?: boolean;
  type?: string;
};

export type SpaceType = "Public" | "Exclusive";

export type CreateSpaceData = {
  spaceId?: string;
  name: string;
  description?: string;
  attachment?: LocalAttachment | null;
  emoji?: string | null;
  url?: string | null;
  spaceType: SpaceType;
  spaceBadgeId?: number;
  condition?: {
    address?: string;
    amount?: number;
    amountInput?: string;
    network?: string;
    name?: string;
    image_url?: string;
    token_type?: string;
  } | null;
};

export interface UserNFTCollection {
  name: string;
  description: string;
  contract_address: string;
  token_type: string;
  image_url: string;
  background_image_url: string;
  external_url: string;
  symbol: string;
  network: string;
}

export interface UserData {
  avatar_url: string;
  encrypt_message_key?: string;
  is_verified_avatar?: boolean;
  is_verified_username?: boolean;
  nonce?: string;
  user_id: string;
  user_name: string;
  role?: string;
  status?: string;
  direct_channel?: string;
  user_channels?: Array<string>;
}

export interface Channel {
  channel_emoji?: string;
  channel_id: string;
  channel_image_url?: string;
  channel_member: Array<string>;
  channel_name: string;
  channel_type: "Public" | "Private" | "Direct";
  notification_type: string;
  seen: boolean;
  space?: Space;
  space_id?: string;
  user?: UserData;
  group_channel_id?: string;
  attachment?: any;
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
  channels: Array<Channel>;
}

export interface Community {
  team_display_name: string;
  team_icon: string;
  team_id: string;
  team_url: string;
}

export interface NFTCollection {
  name: string;
  description: string;
  contract_address: string;
  token_type: string;
  image_url: string;
  background_image_url: string;
  external_url: string;
  symbol: string;
  network: string;
}

export interface SpaceCollectionData {
  space_condition_id: string;
  space_id: string;
  contract_address: string;
  token_type: string;
  network: string;
  amount: number;
  nft_collection: NFTCollection;
}

export interface SettingItem {
  label: string;
  icon: string;
  id: string;
}

export interface GroupSettingItem {
  id: string;
  groupLabel: string;
  items: Array<SettingItem>;
}

export interface SpaceMember {
  user_id: string;
  user_name: string;
  avatar_url?: string;
}

export interface ReactReducerData {
  count: number;
  isReacted: boolean;
  reactName: string;
  skin: number;
}

export interface AttachmentData {
  file_id: string;
  file_url: string;
  mimetype: string;
  original_name: string;
}

export interface FileApiData {
  file_url: string;
  file: {
    attachment_id: string;
    createdAt: string;
    file_id: string;
    mimetype: string;
    original_name: string;
    team_id: string;
    updatedAt: string;
  };
}

export interface UserReaction {
  attachment_id: string;
  emoji_id: string;
}

export interface TagData {
  mention_id: string;
  tag_type: string;
}

export interface ReactionData {
  attachment_id: string;
  emoji_id: string;
  reaction_count: string;
  skin: number;
}

export interface TaskData {
  channel?: Array<Channel>;
  comment_count: number;
  creator: UserData;
  creator_id: string;
  notes: string;
  reaction_data: Array<ReactionData>;
  status: "pinned" | "todo" | "doing" | "done" | "archived";
  task_attachment: Array<AttachmentData>;
  task_id: string;
  task_tag: Array<TagData>;
  title: string;
  up_votes: number;
  user_reaction: Array<UserReaction>;
  assignee?: UserData;
  due_date?: Date | string;
  isHighLight?: boolean;
}

export interface ConversationData {
  content: string;
  createdAt: string;
  message_attachment: Array<AttachmentData>;
  message_id: string;
  message_tag: Array<TagData>;
  parent_id: string;
  plain_text: string;
  sender_id: string;
  updatedAt: string;
  task: TaskData;
  isHead: boolean;
  isSending?: boolean;
  isConversationHead: boolean;
  reaction_data: Array<ReactionData>;
  user_reaction: Array<UserReaction>;
}

export interface MessageData extends ConversationData {
  conversation_data: Array<ConversationData>;
}

export interface ReactUserApiData {
  emoji_id: string;
  skin: number;
  user_id: string;
}

export type MessageGroup = { date: string; messages: Array<MessageData> };

export interface TaskActivityData {
  action: string;
  createdAt: string;
  previous_value: string;
  task_activity_id: string;
  task_id: string;
  team_id: string;
  updatedAt: string;
  updated_key: string;
  updated_value: string;
  user_data: Array<UserData>;
  user_id: string;
}

interface ImageConfig {
  avatar: string;
  logo: string;
  message: string;
  task: string;
}

export interface InitialApiData {
  force_update: boolean;
  img_domain: string;
  version: string;
  img_config: ImageConfig;
}
