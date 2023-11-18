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
import useDataNonFollowerUser from "hooks/useDataNonFollowerUser";
import NonFollowerUser from "./NonFollowerUser";
import useAppDispatch from "hooks/useAppDispatch";
import { getNonFollowUsers } from "reducers/FCAnalyticReducers";

interface IAnalytics {
  username?: string;
  period: ActivityPeriod;
}

const Analytics = ({ username, period }: IAnalytics) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.fcAnalytic.filters);
  const fcActivities = useFCActivitiesByName(username, period);
  const dataEngagement = useFCUserDataEngagement(username);
  const dataActivities = useFCUserDataActivities(username);
  const dataNonFollowerUser = useDataNonFollowerUser(username);
  const user = useAppSelector((state) => state.fcUser.data);
  const onLoadMoreUnFollowUsers = useCallback(() => {
    if (!user) {
      const loginElement = document.getElementById("btn-login");
      loginElement?.click();
      return;
    } else if (username) {
      dispatch(
        getNonFollowUsers({
          username,
          page: (dataNonFollowerUser?.currentPage || 1) + 1,
          limit: 10,
        })
      );
    }
  }, [dataNonFollowerUser?.currentPage, dispatch, user, username]);
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
          showSuffix
        />
        <ActivityItem label="Casts" activity={fcActivities?.data?.cast} />
      </div>
      <div className={styles.charts}>
        <EngagementChart data={dataEngagement?.data} />
        <ActivityChart data={dataActivities?.data} />
      </div>
      <NonFollowerUser
        data={dataNonFollowerUser}
        onLoadMore={onLoadMoreUnFollowUsers}
      />
    </div>
  );
};

export default memo(Analytics);
