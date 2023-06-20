import { Channel, LocalAttachment } from "./Community";
import { UserData } from "./User";

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
}