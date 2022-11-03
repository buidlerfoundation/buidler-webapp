import moment from "moment";
import { TaskData } from "renderer/models";
import images from "../common/images";
import { dateFormatted } from "../utils/DateUtils";

export const getToggleState = (group: any) => {
  const keys = Object.keys(group);
  const res: any = {};
  keys.forEach((k) => {
    res[k] = true;
  });
  return res;
};

export const groupTaskByFiltered = (filterName: string, task: Array<any>) => {
  let res;
  if (filterName === "Status") {
    res = task.reduce(
      (result, val) => {
        if (result[val.status] == null) {
          result[val.status] = [val];
        } else {
          result[val.status].push(val);
        }
        result[val.status].sort((item1: any, item2: any) =>
          item1.up_votes > item2.up_votes ? -1 : 1
        );
        return result;
      },
      { pinned: [], todo: [], doing: [], done: [] }
    );
  } else if (filterName === "Due Date") {
    res = task
      .sort((v1: any, v2: any) => {
        if (new Date(v1.due_date).getTime() > new Date(v2.due_date).getTime()) {
          return -1;
        }
        if (new Date(v1.due_date).getTime() < new Date(v2.due_date).getTime()) {
          return 1;
        }
        return 0;
      })
      .reduce((result, val) => {
        const date = val.due_date
          ? dateFormatted(val.due_date, "MM-DD-YYYY")
          : "No date";
        if (result[date] == null) {
          result[date] = [val];
        } else {
          result[date].push(val);
        }
        result[date].sort((item1: any, item2: any) =>
          item1.up_votes > item2.up_votes ? -1 : 1
        );
        return result;
      }, {});
  } else if (filterName === "Channel") {
    res = task.reduce((result, val) => {
      const key =
        val.channel.length > 1 ? val.channel[1].channel_name : "Other";
      if (result[key] == null) {
        result[key] = [val];
      } else {
        result[key].push(val);
      }
      result[key].sort((item1: any, item2: any) =>
        item1.up_votes > item2.up_votes ? -1 : 1
      );
      return result;
    }, {});
  } else if (filterName === "Assignee") {
    res = task.reduce(
      (result, val) => {
        const key = val?.assignee?.user_id || val?.assignee_id || "Unassigned";
        if (result[key] == null) {
          result[key] = [val];
        } else {
          result[key].push(val);
        }
        result[key].sort((item1: any, item2: any) =>
          item1.up_votes > item2.up_votes ? -1 : 1
        );
        return result;
      },
      { Unassigned: [] }
    );
    if (res.Unassigned.length === 0) {
      delete res.Unassigned;
    }
  }
  return res;
};

export const getIconByStatus = (status: string) => {
  switch (status) {
    case "pinned":
      return images.icStatusPinned;
    case "todo":
      return images.icCheckOutline;
    case "doing":
      return images.icCheckDoing;
    case "done":
      return images.icCheckDone;
    case "archived":
      return images.icCheckArchived;
    default:
      return images.icCheckOutline;
  }
};

export const isFilterStatus = (id: string) => {
  return (
    id === "pinned" ||
    id === "todo" ||
    id === "doing" ||
    id === "done" ||
    id === "archived"
  );
};

export const getGroupTask = (filterName: string, title: any) => {
  if (filterName === "Status") {
    switch (title) {
      case "pinned":
        return "Pinned";
      case "todo":
        return "Todo";
      case "doing":
        return "Doing";
      case "done":
        return "Done";
      default:
        return "Todo";
    }
  } else if (filterName === "Due Date") {
    if (title === "No date") return title;
    const time = moment(new Date(title)).calendar(null, {
      sameDay: "[Today]",
      nextDay: "[Tomorrow]",
      lastWeek: "[Last] dddd",
      lastDay: "[Yesterday]",
      nextWeek: "[Next] dddd",
      sameElse: "MM-DD-YYYY",
    });
    return time;
  } else if (filterName === "Channel") {
    return `# ${title}`;
  }
  return title;
};

export const sortPinPost = (v1: TaskData, v2: TaskData) => {
  // if (v1.up_votes > v2.up_votes) return -1;
  // if (v1.up_votes < v2.up_votes) return 1;
  if ((v1.updatedAt || "") > (v2.updatedAt || "")) return -1;
  if ((v1.updatedAt || "") < (v2.updatedAt || "")) return 1;
  return 0;
};
