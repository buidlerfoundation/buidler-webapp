"use client";

import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import { IFCUser, IUserTabPath } from "models/FC";
import UserItem from "shared/UserItem";
import AppConfig from "common/AppConfig";
import useAppDispatch from "hooks/useAppDispatch";
import LoadingItem from "shared/LoadingItem";
import useDataFollowUser from "hooks/useDataFollowUser";
import useFCUserByName from "hooks/useFCUserByName";
import useAppSelector from "hooks/useAppSelector";
import { useParams } from "next/navigation";
import { getDataFollowUsers } from "reducers/InsightReducers";

interface IUserFollowers {
  path: IUserTabPath;
}

const UserFollowers = ({ path }: IUserFollowers) => {
  const dispatch = useAppDispatch();
  const params = useParams<{ username: string }>();
  const username = useMemo(() => params?.username, [params?.username]);
  const user = useAppSelector((state) => state.fcUser.data);
  const fcUser = useFCUserByName(username);
  const dataFollowUser = useDataFollowUser(fcUser?.data?.fid, path);
  const users = useMemo(
    () => dataFollowUser?.data || [],
    [dataFollowUser?.data]
  );
  const disabled = useMemo(() => {
    if (path === "/non-follower") {
      return !user?.fid;
    }
    return false;
  }, [path, user?.fid]);
  const renderUser = useCallback(
    (user: IFCUser) => <UserItem user={user} key={user.fid} path={path} />,
    [path]
  );
  const onPageEndReach = useCallback(() => {
    if (
      !dataFollowUser?.canMore ||
      dataFollowUser?.loadMore ||
      !fcUser?.data?.fid
    )
      return;
    dispatch(
      getDataFollowUsers({
        username: fcUser?.data?.fid,
        page: (dataFollowUser?.currentPage || 1) + 1,
        limit: 20,
        path,
      })
    );
  }, [
    dataFollowUser?.canMore,
    dataFollowUser?.currentPage,
    dataFollowUser?.loadMore,
    dispatch,
    path,
    fcUser?.data?.fid,
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
    if (fcUser?.data?.fid && !dataFollowUser && path !== "/non-follower") {
      dispatch(
        getDataFollowUsers({
          username: fcUser?.data?.fid,
          page: 1,
          limit: 20,
          path,
        })
      );
    }
  }, [dataFollowUser, dispatch, path, fcUser?.data?.fid]);
  useEffect(() => {
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  if (disabled) return null;
  return (
    <div className={styles.container}>
      {users.map(renderUser)}
      {dataFollowUser?.loadMore && <LoadingItem />}
    </div>
  );
};

export default memo(UserFollowers);
