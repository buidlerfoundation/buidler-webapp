import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";
import { IDataUserEngagement } from "models/FC";
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { normalizeActivitiesData } from "helpers/ChartHelper";
import ChartXAxis from "./ChartXAxis";
import { formatNumber } from "helpers/StringHelper";
import { getTimeZoneOffsetFormatted } from "utils/DateUtils";

interface IActivityChart {
  data?: IDataUserEngagement;
}

const ActivityChart = ({ data }: IActivityChart) => {
  const dataChart = useMemo(() => {
    if (!data)
      return {
        max: 0,
        dataChart: [],
      };
    return normalizeActivitiesData(data);
  }, [data]);
  const max = useMemo(
    () => dataChart.max + Math.max(10, dataChart.max * 0.2),
    [dataChart]
  );
  const formattedOffset = useMemo(() => getTimeZoneOffsetFormatted(), []);
  return (
    <div className={styles["chart-item"]}>
      <div className={styles["label-wrap"]}>
        <span className={styles.label}>Activities by Hours</span>
        <span className={styles["sub-label"]}>Last 30 days</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dataChart.dataChart}
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        >
          <XAxis dataKey="name" tick={<ChartXAxis />} />
          <YAxis domain={[0, max]} width={1} tick={false} />
          <Tooltip
            content={<ChartTooltip postFix={` (UTC ${formattedOffset})`} />}
            cursor={{ fill: "var(--color-stroke)" }}
          />
          <Bar dataKey="activities" stackId="a" fill="#7c65c1" />
          <ReferenceLine
            y={dataChart.max}
            label={{
              value: formatNumber(dataChart.max),
              position: "top",
              fill: "var(--color-primary-text)",
              fontSize: 12,
            }}
            stroke="#7c65c1"
            strokeDasharray="3 2"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default memo(ActivityChart);
