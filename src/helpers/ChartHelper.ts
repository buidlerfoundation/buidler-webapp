import { IDataUserEngagement } from "models/FC";

export const normalizeEngagementData = (data: IDataUserEngagement) => {
  const { likes, recasts } = data;
  const map: any = {};
  likes.forEach((el) => {
    map[el.formatted_time] = {
      name: el.formatted_time,
      like: el.value,
    };
  });
  recasts.forEach((el) => {
    map[el.formatted_time] = {
      ...(map[el.formatted_time] || {}),
      name: el.formatted_time,
      recast: el.value,
    };
  });
  const dataChart = Object.values(map);
  const max = dataChart.reduce((res: number, val: any) => {
    const total = (val.recast || 0) + (val.like || 0);
    if (total > res) return total;
    return res;
  }, 0);
  return {
    dataChart: dataChart,
    max,
  };
};

export const normalizeActivitiesData = (data: IDataUserEngagement) => {
  const { likes, recasts } = data;
  const map: any = {
    "12AM": { name: "12AM" },
    "1AM": { name: "1AM" },
    "2AM": { name: "2AM" },
    "3AM": { name: "3AM" },
    "4AM": { name: "4AM" },
    "5AM": { name: "5AM" },
    "6AM": { name: "6AM" },
    "7AM": { name: "7AM" },
    "8AM": { name: "8AM" },
    "9AM": { name: "9AM" },
    "10AM": { name: "10AM" },
    "11AM": { name: "11AM" },
    "12PM": { name: "12PM" },
    "1PM": { name: "1PM" },
    "2PM": { name: "2PM" },
    "3PM": { name: "3PM" },
    "4PM": { name: "4PM" },
    "5PM": { name: "5PM" },
    "6PM": { name: "6PM" },
    "7PM": { name: "7PM" },
    "8PM": { name: "8PM" },
    "9PM": { name: "9PM" },
    "10PM": { name: "10PM" },
    "11PM": { name: "11PM" },
  };
  likes.forEach((el) => {
    const key = el.formatted_time.split(":")?.[1] || "";
    map[key] = {
      name: key,
      activities: el.value + (map[key]?.activities || 0),
    };
  });
  recasts.forEach((el) => {
    const key = el.formatted_time.split(":")?.[1] || "";
    map[key] = {
      ...(map[key] || {}),
      name: key,
      activities: el.value + (map[key]?.activities || 0),
    };
  });
  const dataChart = Object.values(map);
  const max = dataChart.reduce((res: number, val: any) => {
    const total = val.activities || 0;
    if (total > res) return total;
    return res;
  }, 0);
  return {
    dataChart,
    max,
  };
};
