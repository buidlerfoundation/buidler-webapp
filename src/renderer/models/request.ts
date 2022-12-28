export type ConfigNotificationRequestBody = {
  notification_type: "Alert" | "Muted" | "Quite";
};

export type DirectChannelRequestBody = {
  channel_type: 'Direct';
  channel_member_data: {
    user_id: string;
    key: string;
    timestamp: number;
  }[];
};
