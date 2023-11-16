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
  const map: any = {};
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
