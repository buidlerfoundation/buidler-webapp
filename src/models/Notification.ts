import { Channel } from "./Community";
import { TaskData } from "./Message";
import { UserData } from "./User";

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
  community_id?: string;
  to_user_id?: string;
  updatedAt?: string;
  itemType?: string;
};

export type NotificationFilterType = "All" | "Mention" | "Unread";

export type ConfigNotificationRequestBody = {
  notification_type: "alert" | "muted" | "quite";
};

export type DirectChannelRequestBody = {
  channel_type: 'Direct';
  channel_member_data: {
    user_id: string;
    key: string;
    timestamp: number;
  }[];
};