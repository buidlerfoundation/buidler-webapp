import { NotificationData } from "models/Notification";
import { dateFormatted } from "utils/DateUtils";

export const normalizeNotificationData = (data: NotificationData[]) => {
  return data.reduce<Array<NotificationData>>((res, val, index) => {
    res.push(val);
    const nextVal = data[index + 1];
    const time = dateFormatted(new Date(val.createdAt), "MMM DD, YYYY");
    const nextTime = nextVal
      ? dateFormatted(new Date(nextVal.createdAt), "MMM DD, YYYY")
      : null;
    if (nextTime && nextTime !== time) {
      res.push({
        itemType: "Separate",
        content: nextTime,
        notification_id: nextTime,
        createdAt: nextVal.createdAt,
      });
    }
    return res;
  }, []);
};
