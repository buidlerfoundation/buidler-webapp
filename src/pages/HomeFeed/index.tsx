"use client";

import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import { ICast } from "models/FC";
import FeedItem from "shared/FeedItem";
import Spinner from "shared/Spinner";
import useFeedData from "hooks/useFeedData";
import useAppDispatch from "hooks/useAppDispatch";
import { getFeed } from "reducers/HomeFeedReducers";
import LoadingItem from "shared/LoadingItem";
import AppConfig from "common/AppConfig";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import { FC_USER_ACTIONS } from "reducers/FCUserReducers";
import { usePathname } from "next/navigation";

interface IHomeFeed {
  filter: string;
}

const HomeFeed = ({ filter }: IHomeFeed) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const feedData = useFeedData(filter);
  const onLogin = useCallback(() => {
    dispatch(FC_USER_ACTIONS.updateLoginSource("Home Feed"));
    const loginElement = document.getElementById("btn-login");
    loginElement?.click();
  }, [dispatch]);
  const renderFeed = useCallback(
    (cast: ICast) => <FeedItem key={cast.hash} cast={cast} onLogin={onLogin} />,
    [onLogin]
  );
  const feeds = useMemo(() => feedData?.data || [], [feedData?.data]);
  const eventNameByPath = useMemo(() => {
    if (pathname === "/home") return "Trending Links Viewed";
    if (pathname === "/active") return "Active Links Viewed";
    if (pathname === "/top") return "Top Links Viewed";
    return "";
  }, [pathname]);
  const onPageEndReach = useCallback(() => {
    if (feedData?.canMore && !feedData?.loadMore) {
      dispatch(
        getFeed({
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
      dispatch(getFeed({ type: filter, page: 1, limit: 20 }));
    }
  }, [dispatch, feedData, filter]);
  useEffect(() => {
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    GoogleAnalytics.tracking("Page Viewed", {
      category: "Traffic",
      page_name: "NewsFeed",
      source: query.get("ref") || "",
      path: window.location.pathname,
    });
  }, []);
  useEffect(() => {
    if (eventNameByPath) {
      GoogleAnalytics.tracking(eventNameByPath, { category: "NewsFeed" });
    }
  }, [eventNameByPath]);
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

export default memo(HomeFeed);
