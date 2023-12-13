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
import useDataFollowUser from "hooks/useDataFollowUser";
import useAppDispatch from "hooks/useAppDispatch";
import { FC_USER_ACTIONS } from "reducers/FCUserReducers";
import { usePathname, useRouter } from "next/navigation";
import PastRelation from "./PastRelation";
import useFCUserPastRelation from "hooks/useFCUserPastRelation";

interface IAnalytics {
  fid?: string;
  period: ActivityPeriod;
  username?: string;
}

const Analytics = ({ fid, period, username }: IAnalytics) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.insights.filters);
  const fcActivities = useFCActivitiesByName(fid, period);
  const dataEngagement = useFCUserDataEngagement(fid);
  const dataPastRelation = useFCUserPastRelation(fid);
  const dataActivities = useFCUserDataActivities(fid);
  const dataNonFollowerUser = useDataFollowUser(fid, "/non-follower");
  const dataTopInteraction = useDataTopInteraction(fid);
  const user = useAppSelector((state) => state.fcUser.data);
  const onViewAll = useCallback(() => {
    if (!user) {
      dispatch(FC_USER_ACTIONS.updateLoginSource("View Non Follower"));
      const loginElement = document.getElementById("btn-login");
      loginElement?.click();
      return;
    } else {
      router.push(`${pathname}/non-follower`);
    }
  }, [dispatch, pathname, router, user]);
  return (
    <div className={styles["analytic-wrap"]}>
      <div className={styles["activity-head"]}>
        <span className={styles.label}>Overview</span>
        <div className={styles.filter}>
          {filters?.map((filter) => (
            <FilterItem item={filter} key={filter.period} />
          ))}
        </div>
      </div>
      <div className={styles.activities}>
        <ActivityItem
          label="Followers"
          activity={fcActivities?.data?.follower}
          showSuffix
          loading={fcActivities?.loading}
        />
        <ActivityItem
          label="Casts"
          activity={fcActivities?.data?.cast}
          loading={fcActivities?.loading}
        />
      </div>
      <div className={styles.charts}>
        <EngagementChart data={dataEngagement?.data} />
        <ActivityChart data={dataActivities?.data} />
        <PastRelation data={dataPastRelation?.data} name={username} fid={fid} />
      </div>
      <TopInteractions data={dataTopInteraction} />
      <NonFollowerUser data={dataNonFollowerUser} onViewAll={onViewAll} />
    </div>
  );
};

export default memo(Analytics);
