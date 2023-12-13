"use client";
import useAppSelector from "hooks/useAppSelector";
import useFCUserByName from "hooks/useFCUserByName";
import useFCUserPastRelationReaction from "hooks/useFCUserPastRelationReaction";
import { IPastRelationReactionData } from "models/FC";
import { useParams } from "next/navigation";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import LoadingItem from "shared/LoadingItem";
import AppConfig from "common/AppConfig";
import useAppDispatch from "hooks/useAppDispatch";
import { getPastRelationReaction } from "reducers/InsightReducers";
import PastReactionItem from "shared/PastReactionItem";

const UserPastRelationReaction = () => {
  const dispatch = useAppDispatch();
  const params = useParams<{ username: string }>();
  const username = useMemo(() => params?.username, [params?.username]);
  const user = useAppSelector((state) => state.fcUser.data);
  const fcUser = useFCUserByName(username);
  const dataPastRelationReaction = useFCUserPastRelationReaction(
    fcUser?.data?.fid
  );
  const data = useMemo(
    () => dataPastRelationReaction?.data || [],
    [dataPastRelationReaction?.data]
  );
  const disabled = useMemo(() => {
    return !user?.fid;
  }, [user?.fid]);
  const isEmpty = useMemo(
    () =>
      dataPastRelationReaction &&
      !dataPastRelationReaction?.loading &&
      data.length === 0,
    [data.length, dataPastRelationReaction]
  );
  const renderReaction = useCallback(
    (item: IPastRelationReactionData) => (
      <PastReactionItem
        item={item}
        name={username}
        key={`${item.reaction_type}-${item.hash}`}
      />
    ),
    [username]
  );
  const onPageEndReach = useCallback(() => {
    if (
      !dataPastRelationReaction?.canMore ||
      dataPastRelationReaction?.loadMore ||
      !fcUser?.data?.fid
    )
      return;
    dispatch(
      getPastRelationReaction({
        fid: fcUser?.data?.fid,
        page: (dataPastRelationReaction?.currentPage || 1) + 1,
        limit: 20,
      })
    );
  }, [
    dataPastRelationReaction?.canMore,
    dataPastRelationReaction?.loadMore,
    dataPastRelationReaction?.currentPage,
    fcUser?.data?.fid,
    dispatch,
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
    if (fcUser?.data?.fid && !dataPastRelationReaction) {
      dispatch(
        getPastRelationReaction({
          fid: fcUser?.data?.fid,
          page: 1,
          limit: 20,
        })
      );
    }
  }, [dispatch, fcUser?.data?.fid, dataPastRelationReaction]);
  useEffect(() => {
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  if (disabled) return null;
  if (isEmpty) {
    return (
      <div className={`${styles.container} ${styles.empty}`}>
        Seems like you and A haven't had any reactions yet. Let's make some
        memorable moments together!
      </div>
    );
  }
  return (
    <div className={styles.container}>
      {data.map(renderReaction)}
      {dataPastRelationReaction?.loadMore && <LoadingItem />}
    </div>
  );
};

export default memo(UserPastRelationReaction);
