import moment from "moment";

export const activityFromNow = (date: any) => {
  if (!date) return "";
  return moment(date).fromNow();
};

export const dateFormatted = (date: any, format = "MMM DD") => {
  return moment(date).format(format);
};

export const taskFromNow = (date: any) => {
  const time = moment(new Date(date)).calendar(null, {
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    lastWeek: "[Last] dddd",
    lastDay: "[Yesterday]",
    nextWeek: "[Next] dddd",
    sameElse: "MMM DD",
  });
  return time;
};

export const fromNow = (date: any) => {
  const time = moment(new Date(date)).calendar(null, {
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    lastWeek: "[Last] dddd",
    lastDay: "[Yesterday]",
    nextWeek: "[Next] dddd",
    sameElse: "MM-DD-YYYY",
  });
  return time;
};

export const lastReplyFromNow = (date: any) => {
  const time = moment(new Date(date)).calendar(null, {
    sameDay: "[Today at] HH:mm",
    lastDay: "[Yesterday]",
    lastWeek: "MM-DD-YYYY",
    sameElse: "MM-DD-YYYY",
  });
  return time;
};

export const notificationFromNow = (date: any) => {
  const time = moment(new Date(date)).calendar(null, {
    sameDay: `[${moment(new Date(date)).fromNow()}]`,
    lastDay: "[Yesterday at] HH:mm",
    lastWeek: "MM-DD-YYYY [at] HH:mm",
    sameElse: "MM-DD-YYYY [at] HH:mm",
  });
  return time;
};

export const messageFromNow = (date: any) => {
  const time = moment(new Date(date)).calendar(null, {
    sameDay: "[Today at] HH:mm",
    lastDay: "[Yesterday at] HH:mm",
    lastWeek: "MM-DD-YYYY [at] HH:mm",
    sameElse: "MM-DD-YYYY [at] HH:mm",
  });
  return time;
};

export const titleMessageFromNow = (date: any) => {
  const time = moment(new Date(date)).calendar(null, {
    sameDay: "[Today]",
    lastDay: "[Yesterday]",
    lastWeek: "MMM DD, YYYY",
    sameElse: "MMM DD, YYYY",
  });
  return time;
};

export const isOverDate = (date: any) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return moment(date).isBefore(today);
};
