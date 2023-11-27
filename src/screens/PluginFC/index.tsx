"use client";

import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import useAppDispatch from "hooks/useAppDispatch";
import useAppSelector from "hooks/useAppSelector";
import { getCastsByUrl } from "reducers/FCCastReducers";
import CastItem from "shared/CastItem";
import LoadingItem from "shared/LoadingItem";
import Empty from "./Empty";
import EmbeddedMain from "shared/EmbeddedMain";
import Spinner from "shared/Spinner";

const PluginFC = () => {
  const dispatch = useAppDispatch();
  const queryUrl = useAppSelector((state) => state.fcCast.queryUrl);
  const casts = useAppSelector((state) => state.fcCast.data);
  const canMoreCast = useAppSelector((state) => state.fcCast.canMore);
  const loadingCast = useAppSelector((state) => state.fcCast.loading);
  const loadMoreCast = useAppSelector((state) => state.fcCast.loadMore);
  const currentPageCast = useAppSelector((state) => state.fcCast.currentPage);
  const onMoreCast = useCallback(() => {
    if (queryUrl) {
      dispatch(
        getCastsByUrl({ text: queryUrl, page: currentPageCast + 1, limit: 20 })
      );
    }
  }, [currentPageCast, dispatch, queryUrl]);
  const onScroll = useCallback(
    (e: any) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const compare = Math.round(scrollTop + clientHeight);
      if (
        (compare === scrollHeight + 1 || compare === scrollHeight) &&
        canMoreCast &&
        !loadMoreCast
      ) {
        onMoreCast();
      }
    },
    [canMoreCast, loadMoreCast, onMoreCast]
  );
  const renderBody = useCallback(() => {
    if (loadingCast) {
      return <Spinner size={30} />;
    }
    if (!loadingCast && casts.length === 0) {
      return <Empty />;
    }
    return (
      <ol className={styles["list-cast"]} onScroll={onScroll}>
        {casts.map((el) => (
          <CastItem key={el.hash} cast={el} postMessageOpenImageFullscreen />
        ))}
        {loadMoreCast && <LoadingItem />}
      </ol>
    );
  }, [casts, loadMoreCast, loadingCast, onScroll]);
  return (
    <div className={styles.container}>
      <EmbeddedMain />
      {renderBody()}
    </div>
  );
};

export default memo(PluginFC);
