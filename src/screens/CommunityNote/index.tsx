"use client";
import React, { memo, useCallback, useEffect } from "react";
import styles from "./index.module.scss";
import CommunityNoteItem from "shared/CommunityNoteItem";
import useAppDispatch from "hooks/useAppDispatch";
import useAppSelector from "hooks/useAppSelector";
import { getNotesByUrl } from "reducers/CommunityNoteReducers";
import Spinner from "shared/Spinner";
import Empty from "./Empty";
import LoadingItem from "shared/LoadingItem";
import AppConfig from "common/AppConfig";

const CommunityNote = () => {
  const dispatch = useAppDispatch();
  const queryUrl = useAppSelector((state) => state.fcCast.queryUrl);
  const notes = useAppSelector((state) => state.communityNote.feed.data);
  const canMore = useAppSelector((state) => state.communityNote.feed.canMore);
  const loading = useAppSelector((state) => state.communityNote.feed.loading);
  const loadMore = useAppSelector((state) => state.communityNote.feed.loadMore);
  const currentPage = useAppSelector(
    (state) => state.communityNote.feed.currentPage
  );
  const onLogin = useCallback(() => {
    const loginElement = document.getElementById("btn-login");
    loginElement?.click();
  }, []);
  const onMore = useCallback(() => {
    if (queryUrl) {
      dispatch(
        getNotesByUrl({
          url: queryUrl,
          page: (currentPage || 1) + 1,
          limit: 20,
        })
      );
    }
  }, [currentPage, dispatch, queryUrl]);
  const renderBody = useCallback(() => {
    if (loading) {
      return <Spinner size={30} />;
    }
    if (!loading && notes && notes.length === 0) {
      return <Empty />;
    }
    return (
      <ol className={styles["list-cast"]}>
        {notes?.map((el) => (
          <CommunityNoteItem key={el.id} note={el} onLogin={onLogin} />
        ))}
        {loadMore && <LoadingItem />}
      </ol>
    );
  }, [loadMore, loading, notes, onLogin]);
  const onPageEndReach = useCallback(() => {
    if (canMore && !loadMore) {
      onMore();
    }
  }, [canMore, loadMore, onMore]);
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
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  return <div className={styles.container}>{renderBody()}</div>;
};

export default memo(CommunityNote);
