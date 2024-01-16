"use client";

import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import useAppDispatch from "hooks/useAppDispatch";
import { getDashboardLinks } from "reducers/CommunityNoteReducers";
import LoadingItem from "shared/LoadingItem";
import Spinner from "shared/Spinner";
import { IDashboardLink, IReport } from "models/CommunityNote";
import useDashboardLinkData from "hooks/useDashboardLinkData";
import DashboardLinkItem from "shared/DashboardLinkItem";
import AppConfig from "common/AppConfig";

interface INoteFeed {
  filter: string;
}

const NoteFeed = ({ filter }: INoteFeed) => {
  const dispatch = useAppDispatch();
  const feedData = useDashboardLinkData(filter);
  const feeds = useMemo(() => feedData?.data || [], [feedData?.data]);
  const feedsWithFiltered = useMemo(() => {
    if (filter === "new") {
      return feeds.filter((el) => !el.total_notes);
    }
    return feeds;
  }, [feeds, filter]);

  const renderFeed = useCallback(
    (dashboardLink: IDashboardLink) => (
      <DashboardLinkItem
        key={dashboardLink.url}
        dashboardLink={dashboardLink}
      />
    ),
    []
  );
  const onPageEndReach = useCallback(() => {
    if (feedData?.canMore && !feedData?.loadMore) {
      dispatch(
        getDashboardLinks({
          type: filter,
          page: (feedData?.currentPage || 1) + 1,
          limit: 20,
        })
      );
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
      dispatch(getDashboardLinks({ type: filter, page: 1, limit: 20 }));
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
      {feedsWithFiltered.length > 0 ? (
        <>
          {feedsWithFiltered.map(renderFeed)}
          {feedData?.loadMore && <LoadingItem />}
        </>
      ) : feedData?.loading ? (
        <Spinner size={30} />
      ) : null}
    </ol>
  );
};

export default memo(NoteFeed);
