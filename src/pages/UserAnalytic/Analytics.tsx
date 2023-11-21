import React, { memo, useCallback } from "react";
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
import NonFollowerUser from "./NonFollowerUser";
import TopInteractions from "./TopInteractions";
import useDataTopInteraction from "hooks/useDataTopInteraction";
import { useNavigate } from "react-router-dom";
import useDataFollowUser from "hooks/useDataFollowUser";

interface IAnalytics {
  username?: string;
  period: ActivityPeriod;
}

const Analytics = ({ username, period }: IAnalytics) => {
  const navigate = useNavigate();
  const filters = useAppSelector((state) => state.fcAnalytic.filters);
  const fcActivities = useFCActivitiesByName(username, period);
  const dataEngagement = useFCUserDataEngagement(username);
  const dataActivities = useFCUserDataActivities(username);
  const dataNonFollowerUser = useDataFollowUser(username, "/non-follower");
  const dataTopInteraction = useDataTopInteraction(username);
  const user = useAppSelector((state) => state.fcUser.data);
  const onViewAll = useCallback(() => {
    if (!user) {
      const loginElement = document.getElementById("btn-login");
      loginElement?.click();
      return;
    } else {
      navigate("non-follower", { state: { goBack: true } });
    }
  }, [navigate, user]);
  return (
    <div className={styles["analytic-wrap"]}>
      <div className={styles["activity-head"]}>
        <span className={styles.label}>Overview</span>
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
          showSuffix
        />
        <ActivityItem label="Casts" activity={fcActivities?.data?.cast} />
      </div>
      <div className={styles.charts}>
        <EngagementChart data={dataEngagement?.data} />
        <ActivityChart data={dataActivities?.data} />
      </div>
      <TopInteractions data={dataTopInteraction} />
      <NonFollowerUser data={dataNonFollowerUser} onViewAll={onViewAll} />
    </div>
  );
};

export default memo(Analytics);
