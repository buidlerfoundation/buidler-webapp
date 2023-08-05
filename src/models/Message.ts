import { LocalAttachment } from "./Community";
import { UserData } from "./User";

export type ActiveTab = "chat" | "pin" | "review" | "hacker-new" | "";

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
  conversation_data?: ConversationData | null;
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

export interface ITopicComment {
  comment_id: string;
  content: string;
  author_id: string;
  topic_id: string;
  parent_id: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  author: UserData;
  total_comments: number;
  root_parent_id?: string;
  reaction_data: { [key: string]: number };
  user_reaction_data: { [key: string]: number };
}

export interface PostData {
  author_id: string;
  author?: UserData;
  comments?: ITopicComment[];
  content: string;
  created_at: string;
  is_deleted: boolean;
  root_channel_id: string;
  topic_id: string;
  total_comments?: number;
  updated_at: string;
  reaction_data: { [key: string]: number };
  user_reaction_data: { [key: string]: number };
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
  topic?: PostData;
  is_deleted?: boolean;
  isHead: boolean;
  isSending?: boolean;
  isConversationHead?: boolean;
  reaction_data: { [key: string]: number };
  user_reaction_data: { [key: string]: number };
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
  user?: UserData;
}
