"use client";

import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import useAppDispatch from "hooks/useAppDispatch";
import {
  getMyDashboardLinkNotes,
  getMyDashboardLinkRatings,
} from "reducers/CommunityNoteReducers";
import LoadingItem from "shared/LoadingItem";
import Spinner from "shared/Spinner";
import { IDashboardLink } from "models/CommunityNote";
import DashboardLinkItem from "shared/DashboardLinkItem";
import AppConfig from "common/AppConfig";
import useMyDashboardLinkData from "hooks/useMyDashboardLinkData";

interface IMyFeed {
  filter: "notes" | "ratings";
}

const MyFeed = ({ filter }: IMyFeed) => {
  const dispatch = useAppDispatch();
  const feedData = useMyDashboardLinkData(filter);
  const feeds = useMemo(() => feedData?.data || [], [feedData?.data]);

  const renderFeed = useCallback(
    (dashboardLink: IDashboardLink) => (
      <DashboardLinkItem
        key={dashboardLink.note?.id}
        dashboardLink={dashboardLink}
      />
    ),
    []
  );
  const onPageEndReach = useCallback(() => {
    if (feedData?.canMore && !feedData?.loadMore) {
      if (filter === "notes") {
        dispatch(
          getMyDashboardLinkNotes({
            page: (feedData?.currentPage || 1) + 1,
            limit: 20,
          })
        );
      } else {
        dispatch(
          getMyDashboardLinkRatings({
            page: (feedData?.currentPage || 1) + 1,
            limit: 20,
          })
        );
      }
    }
  }, [
    dispatch,
    feedData?.canMore,
    feedData?.currentPage,
    feedData?.loadMore,
    filter,
  ]);
  const windowScrollListener = useCallback(() => {
    if (
      Math.ceil(window.innerHeight + document.documentElement.scrollTop) >=
      Math.ceil(
        document.documentElement.offsetHeight - AppConfig.loadMoreOffset
      )
    ) {
      onPageEndReach();
    }
  }, [onPageEndReach]);

  useEffect(() => {
    if (!feedData) {
      if (filter === "notes") {
        dispatch(getMyDashboardLinkNotes({ page: 1, limit: 20 }));
      } else {
        dispatch(getMyDashboardLinkRatings({ page: 1, limit: 20 }));
      }
    }
  }, [dispatch, feedData, filter]);
  useEffect(() => {
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  return (
    <ol className={styles.list}>
      {feeds.length > 0 ? (
        <>
          {feeds.map(renderFeed)}
          {feedData?.loadMore && <LoadingItem />}
        </>
      ) : feedData?.loading ? (
        <Spinner size={30} />
      ) : null}
    </ol>
  );
};

export default memo(MyFeed);
