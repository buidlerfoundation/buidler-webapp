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
import { normalizeEngagementData } from "helpers/ChartHelper";
import ChartTooltip from "./ChartTooltip";

interface IEngagementChart {
  data?: IDataUserEngagement;
}

const EngagementChart = ({ data }: IEngagementChart) => {
  const dataChart = useMemo(() => {
    if (!data)
      return {
        max: 0,
        dataChart: [],
      };
    return normalizeEngagementData(data);
  }, [data]);
  const max = useMemo(
    () => dataChart.max + Math.max(10, dataChart.max * 0.2),
    [dataChart]
  );
  return (
    <div className={styles["chart-item"]}>
      <span className={styles.label}>Engagement</span>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dataChart.dataChart}
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        >
          <XAxis dataKey="name" height={1} tick={false} />
          <YAxis domain={[0, max]} width={1} tick={false} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "var(--color-stroke)" }}
          />
          <Bar dataKey="like" stackId="a" fill="var(--color-mention)" />
          <Bar dataKey="recast" stackId="a" fill="var(--color-recast)" />
          <ReferenceLine
            y={dataChart.max}
            label={{
              value: `${dataChart.max}`,
              position: "top",
              fill: "var(--color-primary-text)",
              fontSize: 12,
            }}
            stroke="var(--color-mention)"
            strokeDasharray="3 2"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default memo(EngagementChart);
