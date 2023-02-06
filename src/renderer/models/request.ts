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
