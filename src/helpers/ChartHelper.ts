import { IDataChart, IDataUserEngagement } from "models/FC";
import { dateFormatted } from "utils/DateUtils";

export const normalizeEngagementData = (data: IDataUserEngagement) => {
  const { likes, recasts } = data;
  const map: any = {};
  likes.forEach((el) => {
    map[el.formatted_time] = {
      name: dateFormatted(el.formatted_time, "MMM DD"),
      like: el.value,
    };
  });
  recasts.forEach((el) => {
    map[el.formatted_time] = {
      ...(map[el.formatted_time] || {}),
      name: dateFormatted(el.formatted_time, "MMM DD"),
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

const convertHour = (h: string) => {
  if (h === "12AM") return 0;
  if (h === "12PM") return 12;
  const isAM = h.includes("AM");
  if (isAM) return parseInt(h);
  return parseInt(h) + 12;
};

const applyTimeZoneOffset = (h: number) => {
  const timeWithTimeZone = h - new Date().getTimezoneOffset() / 60;
  if (timeWithTimeZone < 0) return timeWithTimeZone + 24;
  if (timeWithTimeZone > 23) return timeWithTimeZone - 24;
  return timeWithTimeZone;
};

export const normalizeActivitiesData = (data: IDataUserEngagement) => {
  const map: any = {
    "0:00": { name: "0:00" },
    "1:00": { name: "1:00" },
    "2:00": { name: "2:00" },
    "3:00": { name: "3:00" },
    "4:00": { name: "4:00" },
    "5:00": { name: "5:00" },
    "6:00": { name: "6:00" },
    "7:00": { name: "7:00" },
    "8:00": { name: "8:00" },
    "9:00": { name: "9:00" },
    "10:00": { name: "10:00" },
    "11:00": { name: "11:00" },
    "12:00": { name: "12:00" },
    "13:00": { name: "13:00" },
    "14:00": { name: "14:00" },
    "15:00": { name: "15:00" },
    "16:00": { name: "16:00" },
    "17:00": { name: "17:00" },
    "18:00": { name: "18:00" },
    "19:00": { name: "19:00" },
    "20:00": { name: "20:00" },
    "21:00": { name: "21:00" },
    "22:00": { name: "22:00" },
    "23:00": { name: "23:00" },
  };
  Object.values(data).forEach((elements: IDataChart[]) => {
    elements.forEach((el) => {
      const time = el.formatted_time.split(":")?.[1] || "";
      const h = convertHour(time);
      const timeWithTZ = applyTimeZoneOffset(h);
      const key = `${timeWithTZ}:00`;
      map[key] = {
        name: key,
        activities: el.value + (map[key]?.activities || 0),
      };
    });
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
