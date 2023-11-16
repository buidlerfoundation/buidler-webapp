import React, { memo } from "react";
import styles from "./index.module.scss";
import useAppSelector from "hooks/useAppSelector";
import FilterItem from "./FilterItem";
import { ActivityPeriod } from "models/FC";
import ActivityItem from "./ActivityItem";
import EngagementChart from "./EngagementChart";
import ActivityChart from "./ActivityChart";
import useFCActivitiesByName from "hooks/useFCActivitiesByName";
import useFCUserDataEngagement from "hooks/useFCUserDataEngagement";
import useFCUserDataActivities from "hooks/useFCUserDataActivities";

interface IAnalytics {
  username?: string;
  period: ActivityPeriod;
}

const Analytics = ({ username, period }: IAnalytics) => {
  const filters = useAppSelector((state) => state.fcAnalytic.filters);
  const fcActivities = useFCActivitiesByName(username, period);
  const dataEngagement = useFCUserDataEngagement(username);
  const dataActivities = useFCUserDataActivities(username);
  return (
    <div className={styles["analytic-wrap"]}>
      <div className={styles["activity-head"]}>
        <span className={styles.label}>Activities</span>
        <div className={styles.filter}>
          {filters.map((filter) => (
            <FilterItem item={filter} key={filter.period} />
          ))}
        </div>
      </div>
      <div className={styles.activities}>
        <ActivityItem
          label="Followers"
          activity={fcActivities?.data?.follower}
        />
        <ActivityItem label="Casts" activity={fcActivities?.data?.cast} />
      </div>
      <div className={styles.charts}>
        <EngagementChart data={dataEngagement?.data} />
        <ActivityChart data={dataActivities?.data} />
      </div>
    </div>
  );
};

export default memo(Analytics);
