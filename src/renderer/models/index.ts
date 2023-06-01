import { ethers } from "ethers";

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

export type SpaceType = "Public" | "Exclusive";

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
  isUpdateCondition?: boolean;
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
  token_id: string;
  nft_collection?: NFTCollection;
  can_set_username?: boolean;
  can_set_avatar?: boolean;
  media: {
    bytes: number;
    format: string;
    gateway: string;
    raw: string;
    thumbnail: string;
  }[];
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
  user_bio?: string;
  spaces?: Array<Space>;
  address?: string;
  verified_avatar_asset_collection?: NFTCollectionDataApi;
  verified_username_asset_collection?: NFTCollectionDataApi;
  is_deleted?: boolean;
  total_unread_notifications?: number;
  direct_channel_id?: string;
  fetching?: boolean;
  public_key?: string;
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
  slug: string;
}

export interface SpaceCollectionData {
  space_condition_id: string;
  space_id: string;
  contract_address: string;
  token_type: string;
  network: string;
  amount: number;
  nft_collection?: NFTCollectionDataApi;
  token_contract?: Contract;
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
  file_url?: string;
  mimetype?: string;
  original_name?: string;
  is_uploaded?: boolean;
  localFile?: LocalAttachment;
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
  channels?: Array<Channel>;
  comment_count: number;
  creator: UserData;
  creator_id: string;
  reaction_data: Array<ReactionData>;
  status: "pinned" | "todo" | "doing" | "done" | "archived";
  task_attachments?: Array<AttachmentData>;
  task_id: string;
  task_tags: Array<TagData>;
  content: string;
  up_votes: number;
  user_reaction: Array<UserReaction>;
  assignee?: UserData;
  due_date?: Date | string;
  isHighLight?: boolean;
  createdAt?: string;
  updatedAt?: string;
  total_messages?: string;
  latest_reply_message_at?: string;
  latest_reply_senders?: Array<string>;
  total_reply_sender?: string;
  root_message_channel_id: string;
  message_created_at: string;
  message_sender_id: string;
  cid?: string;
  uploadingIPFS?: boolean;
  notification_type?: "alert" | "muted";
  total_unread_notifications?: number;
}

export interface ConversationData {
  content: string;
  createdAt: string;
  message_attachments: Array<AttachmentData>;
  message_id: string;
  message_tag: Array<TagData>;
  reply_message_id: string;
  plain_text: string;
  sender_id: string;
  updatedAt: string;
  task?: TaskData;
  isHead: boolean;
  isSending?: boolean;
  isConversationHead?: boolean;
  reaction_data: Array<ReactionData>;
  user_reaction: Array<UserReaction>;
  entity_id: string;
  entity_type: string;
  metadata?: {
    type: "scam_alert" | "asset";
    data: {
      content: string;
      content_type: string;
      created_at: string;
      id: string;
      updated_at: string;
    };
  };
  is_scam_detected?: boolean;
  files?: any[];
}

export interface MessageDateData {
  type: "date";
  value: string;
}

export interface MessageData extends ConversationData {
  conversation_data?: ConversationData;
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
  imgproxy: {
    bucket_name: string;
    domain: string;
  };
}

export interface Contract {
  contract_address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
  is_potential: boolean;
  is_supported: boolean;
  logo: string;
  network: string;
}

export interface TokenPrice {
  current_price: number;
  id: string;
  image: string;
}

export interface Token {
  contract: Contract;
  balance: number;
  price?: TokenPrice;
}

export interface BalanceApiData {
  address: string;
  tokens: Array<Token>;
  coins: Array<Token>;
}

export interface TransactionApiData {
  block_number: string;
  time_stamp: string;
  hash: string;
  nonce: string;
  block_hash: string;
  from: string;
  contract_address: string;
  to: string;
  value: string;
  token_name: string;
  token_symbol: string;
  token_decimal: string;
  transaction_index: string;
  gas: string;
  gas_price: string;
  gas_used: string;
  cumulative_gas_used: string;
  input: string;
  confirmations: string;
  receipt_status: string;
}

export interface NFTCollectionDataApi {
  name: string;
  description?: string;
  contract_address: string;
  token_type: string;
  image_url: string;
  background_image_url: string;
  external_url: string;
  symbol: string;
  network: string;
  nfts: Array<UserNFTCollection>;
  slug: string;
  marketplaces: {
    [key: string]: {
      marketplace: string;
      last_ingested_at: string;
      name: string;
      safelist_request_status: string;
      slug: string;
    };
  };
}

export interface NFTAsset {
  name: string;
  description: string;
  contract_address: string;
  token_id: string;
  token_type: string;
  user_id: string;
  image_url: string;
  background_image_url: string;
  network: string;
  nft_collection: NFTCollection;
}

export interface ENSAsset {
  token_id: string;
  value: string;
  can_set_username: boolean;
  can_set_team_namespace: boolean;
  contract_address: string;
  network: string;
}

export interface CollectibleDataApi {
  ens_assets: Array<ENSAsset>;
  nft_assets: Array<NFTAsset>;
}

export type SendData = {
  recipientAddress?: string;
  asset?: Token | null;
  nft?: UserNFTCollection | null;
  amount?: number | string;
  amountUSD?: number | string;
  gasPrice?: ethers.BigNumber;
  gasLimit: ethers.BigNumber;
  recipientENS?: string | null;
  recipientUser?: UserData | null;
};

export interface BaseDataApi<T> {
  success: boolean;
  data?: T;
  statusCode: number;
  message?: string;
  total?: number;
  token?: string;
  metadata?: {
    total?: number;
    encrypt_message_key?: string;
    can_loadmore_message_after?: boolean;
    can_loadmore_message_before?: boolean;
    is_new_team_member?: boolean;
  };
  refresh_token?: string;
  token_expire_at?: number;
  refresh_token_expire_at?: number;
}

export type UserRoleType = "owner" | "admin" | "member";

export type AssetTypeItem = {
  label: string;
  id: string;
};

export type PinPostData = {
  content: string;
  attachments?: Array<LocalAttachment>;
  channels?: Array<Channel>;
  id?: string;
};

export type NotificationFilterType = "All" | "Mention" | "Unread";

export type NotificationData = {
  channel?: Channel;
  content: string;
  createdAt: string;
  entity_id?: string;
  from_user?: UserData;
  from_user_id?: string;
  is_deleted?: boolean;
  is_read?: boolean;
  message_id?: string;
  notification_id: string;
  post?: TaskData;
  notification_type?:
    | "post_reply"
    | "channel_mention"
    | "post_mention"
    | "channel_reply";
  team_id?: string;
  to_user_id?: string;
  updatedAt?: string;
  itemType?: string;
};

export type ChannelKeyApiData = {
  channel_id: string;
  channel_key_id: string;
  createdAt: string;
  key: string;
  timestamp: number;
  updatedAt: string;
  user_id: string;
};

export type NFTDetailDataApi = {
  _id: string;
  can_set_avatar?: boolean;
  contract_address: string;
  token_id: string;
  user_id: string;
  name: string;
  token_type: string;
  network: string;
  attributes: {
    _id: string;
    contract_address: string;
    token_id: string;
    trait_type: string;
    value: string;
    network: string;
  }[];
  collection: NFTCollectionDataApi;
  media: {
    bytes: number;
    format: string;
    gateway: string;
    raw: string;
    thumbnail: string;
  }[];
};

export interface ProfileApiData {
  profile: {
    user_id?: string;
    team_id?: string;
  };
}
