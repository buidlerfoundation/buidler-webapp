import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import { useParams } from "react-router-dom";
import { IFCUser, IUserTabPath } from "models/FC";
import UserItem from "shared/UserItem";
import AppConfig from "common/AppConfig";
import useAppDispatch from "hooks/useAppDispatch";
import { getDataFollowUsers } from "reducers/FCAnalyticReducers";
import LoadingItem from "shared/LoadingItem";
import useDataFollowUser from "hooks/useDataFollowUser";

interface IUserFollowers {
  path: IUserTabPath;
}

const UserFollowers = ({ path }: IUserFollowers) => {
  const dispatch = useAppDispatch();
  const params = useParams<{ username: string }>();
  const username = useMemo(() => params?.username, [params?.username]);
  const dataFollowUser = useDataFollowUser(username, path);
  const users = useMemo(
    () => dataFollowUser?.data || [],
    [dataFollowUser?.data]
  );
  const renderUser = useCallback(
    (user: IFCUser) => <UserItem user={user} key={user.fid} />,
    []
  );
  const onPageEndReach = useCallback(() => {
    if (!dataFollowUser?.canMore || dataFollowUser?.loadMore || !username)
      return;
    dispatch(
      getDataFollowUsers({
        username,
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
    username,
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
    if (username && !dataFollowUser && path !== "/non-follower") {
      dispatch(
        getDataFollowUsers({
          username,
          page: 1,
          limit: 20,
          path,
        })
      );
    }
  }, [dataFollowUser, dispatch, path, username]);
  useEffect(() => {
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  return (
    <div className={styles.container}>
      {users.map(renderUser)}
      {dataFollowUser?.loadMore && <LoadingItem />}
    </div>
  );
};

export default memo(UserFollowers);
