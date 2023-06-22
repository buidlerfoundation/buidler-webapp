import {
  ConfigNotificationRequestBody,
  NotificationData,
  NotificationFilterType,
} from "models/Notification";
import Caller from "./Caller";

export const getNotification = (
  filterType: NotificationFilterType,
  before?: string
) => {
  let uri = "notifications?page[size]=20";
  if (filterType === "Mention") {
    uri +=
      "&notification_types[]=channel_mention&notification_types[]=post_mention";
  } else if (filterType === "Unread") {
    uri += "&is_read=false";
  }
  if (before) {
    uri += `&page[before]=${before}`;
  }
  return Caller.get<NotificationData[]>(uri);
};

export const readNotification = (notificationId: string) =>
  Caller.put(`notifications/${notificationId}`);

export const readAllNotification = () => Caller.put("notifications");

export const deleteNotification = (notificationId: string) =>
  Caller.delete(`notifications/${notificationId}`);

export const configNotificationFromTask = (
  pinPostId: string,
  data: ConfigNotificationRequestBody
) => Caller.post(`notifications/task/${pinPostId}`, data);

export const updateChannelNotification = (
  channelId: string,
  data: ConfigNotificationRequestBody
) => {
  return Caller.post(`notification-setting`, {
    entity_type: "CHANNEL",
    entity_id: channelId,
    notification_type: data.notification_type,
  });
};
