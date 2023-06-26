import { Channel, LocalAttachment } from "./Community";
import { UserData } from "./User";

export type ActiveTab = "chat" | "pin" | "review";

export type EmitMessageData = {
  entity_id: string;
  content: string;
  plain_text: string;
  mentions?: any[];
  message_id?: string;
  member_data?: { key: string; timestamp: number; user_id: string }[];
  reply_message_id?: string;
  text?: string;
  entity_type?: string;
  file_ids?: string[];
  files?: LocalAttachment[];
};

export interface AttachmentData {
  file_id: string;
  file_url?: string;
  mimetype?: string;
  original_name?: string;
  is_uploaded?: boolean;
  localFile?: LocalAttachment;
}

export interface UserReaction {
  attachment_id: string;
  emoji_id: string;
}

export interface ReactionData {
  attachment_id: string;
  emoji_id: string;
  reaction_count: string;
  skin: number;
}

export interface TagData {
  mention_id: string;
  tag_type: string;
}

export interface PostData {
  content?: string;
  attachments?: AttachmentData[];
  created_at: string;
  creator_id: string;
  creator: UserData;
  ipfs_uploaded_at?: string;
  is_deleted?: boolean;
  post_id: string;
  root_message_created_at: string;
  updated_at: string;
  status: "pinned" | "archived";
  uploadingIPFS?: boolean;
  notification_type?: string;
  post_channels?: { channel: Channel; channel_id: string; post_id: string }[];
}

export interface ConversationData {
  content: string;
  created_at: string;
  attachments: AttachmentData[];
  message_id: string;
  message_tag: Array<TagData>;
  reply_message_id: string;
  plain_text: string;
  sender_id: string;
  updated_at: string;
  post?: PostData;
  is_deleted?: boolean;
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
  sender?: UserData;
}

export interface MessageDateData {
  type: "date";
  value: string;
}

export interface MessageData extends ConversationData {
  conversation_data?: ConversationData | null;
}

export type PayloadMessageListAction = {
  data: MessageData[];
  channelId: string;
  before?: string;
  after?: string;
  canMoreAfter?: boolean;
  canMoreBefore?: boolean;
  messageId?: string;
};

export interface ReactReducerData {
  count: number;
  isReacted?: boolean;
  reactName: string;
  skin: number;
}

export interface ReactUserApiData {
  emoji_id: string;
  skin: number;
  user_id: string;
}
