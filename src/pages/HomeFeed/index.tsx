import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import { ICast } from "models/FC";
import FeedItem from "shared/FeedItem";
import Spinner from "shared/Spinner";
import useFeedData from "hooks/useFeedData";
import useAppDispatch from "hooks/useAppDispatch";
import { getFeed } from "reducers/HomeFeedReducers";
import LoadingItem from "shared/LoadingItem";

interface IHomeFeed {
  filter: string;
}

const HomeFeed = ({ filter }: IHomeFeed) => {
  const dispatch = useAppDispatch();
  const feedData = useFeedData(filter);
  const onLogin = useCallback(() => {
    const loginElement = document.getElementById("btn-login");
    loginElement?.click();
  }, []);
  const renderFeed = useCallback(
    (cast: ICast) => <FeedItem key={cast.hash} cast={cast} onLogin={onLogin} />,
    [onLogin]
  );
  const feeds = useMemo(() => feedData?.data || [], [feedData?.data]);
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
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      onPageEndReach();
    }
  }, [onPageEndReach]);
  useEffect(() => {
    if (feeds.length === 0 && !feedData?.loading) {
      dispatch(getFeed({ type: filter, page: 1, limit: 20 }));
    }
  }, [dispatch, feedData?.loading, feeds.length, filter]);
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

export default memo(HomeFeed);
