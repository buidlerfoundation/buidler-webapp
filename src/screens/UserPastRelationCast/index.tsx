"use client";
import useAppSelector from "hooks/useAppSelector";
import useFCUserByName from "hooks/useFCUserByName";
import useFCUserPastRelationCast from "hooks/useFCUserPastRelationCast";
import { ICast, IUserTabPath } from "models/FC";
import { useParams } from "next/navigation";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import LoadingItem from "shared/LoadingItem";
import CastItem from "shared/CastItem";
import AppConfig from "common/AppConfig";
import useAppDispatch from "hooks/useAppDispatch";
import { getPastRelationCast } from "reducers/InsightReducers";

interface IUserPastRelationCast {
  path: IUserTabPath;
}

const UserPastRelationCast = ({ path }: IUserPastRelationCast) => {
  const dispatch = useAppDispatch();
  const params = useParams<{ username: string }>();
  const username = useMemo(() => params?.username, [params?.username]);
  const user = useAppSelector((state) => state.fcUser.data);
  const fcUser = useFCUserByName(username);
  const dataType = useMemo(
    () => (path === "/relation-reply" ? "reply" : "mention"),
    [path]
  );
  const emptyType = useMemo(
    () => (path === "/relation-reply" ? "replies" : "mentions"),
    [path]
  );
  const dataPastRelationCast = useFCUserPastRelationCast(
    dataType,
    fcUser?.data?.fid
  );
  const data = useMemo(
    () => dataPastRelationCast?.data || [],
    [dataPastRelationCast?.data]
  );
  const disabled = useMemo(() => {
    return !user?.fid;
  }, [user?.fid]);
  const isEmpty = useMemo(
    () =>
      dataPastRelationCast &&
      !dataPastRelationCast?.loading &&
      data.length === 0,
    [data.length, dataPastRelationCast]
  );
  const renderCast = useCallback(
    (item: ICast) => (
      <CastItem
        cast={item}
        key={item.hash}
        homeFeed
        hideAttachment
        openWarpcast
      />
    ),
    []
  );
  const onPageEndReach = useCallback(() => {
    if (
      !dataPastRelationCast?.canMore ||
      dataPastRelationCast?.loadMore ||
      !fcUser?.data?.fid
    )
      return;
    dispatch(
      getPastRelationCast({
        fid: fcUser?.data?.fid,
        page: (dataPastRelationCast?.currentPage || 1) + 1,
        limit: 20,
        type: dataType,
      })
    );
  }, [
    dataPastRelationCast?.canMore,
    dataPastRelationCast?.loadMore,
    dataPastRelationCast?.currentPage,
    fcUser?.data?.fid,
    dispatch,
    dataType,
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
    if (fcUser?.data?.fid && !dataPastRelationCast) {
      dispatch(
        getPastRelationCast({
          fid: fcUser?.data?.fid,
          page: 1,
          limit: 20,
          type: dataType,
        })
      );
    }
  }, [dispatch, fcUser?.data?.fid, dataPastRelationCast, dataType]);
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
        Seems like you and {username} haven't had any {emptyType} yet.
      </div>
    );
  }
  return (
    <div className={styles.container}>
      {data.map(renderCast)}
      {dataPastRelationCast?.loadMore && <LoadingItem />}
    </div>
  );
};

export default memo(UserPastRelationCast);
