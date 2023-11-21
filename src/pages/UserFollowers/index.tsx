import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import { useParams } from "react-router-dom";
import useDataNonFollowerUser from "hooks/useDataNonFollowerUser";
import { IFCUser } from "models/FC";
import UserItem from "shared/UserItem";
import AppConfig from "common/AppConfig";
import useAppDispatch from "hooks/useAppDispatch";
import { getNonFollowUsers } from "reducers/FCAnalyticReducers";
import LoadingItem from "shared/LoadingItem";

const UserFollowers = () => {
  const dispatch = useAppDispatch();
  const params = useParams<{ username: string }>();
  const username = useMemo(() => params?.username, [params?.username]);
  const dataNonFollowerUser = useDataNonFollowerUser(username);
  const users = useMemo(
    () => dataNonFollowerUser?.data || [],
    [dataNonFollowerUser?.data]
  );
  const renderUser = useCallback(
    (user: IFCUser) => <UserItem user={user} key={user.fid} />,
    []
  );
  const onPageEndReach = useCallback(() => {
    if (
      !dataNonFollowerUser?.canMore ||
      dataNonFollowerUser?.loadMore ||
      !username
    )
      return;
    dispatch(
      getNonFollowUsers({
        username,
        page: (dataNonFollowerUser?.currentPage || 1) + 1,
        limit: 10,
      })
    );
  }, [
    dataNonFollowerUser?.canMore,
    dataNonFollowerUser?.currentPage,
    dataNonFollowerUser?.loadMore,
    dispatch,
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
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  return (
    <div className={styles.container}>
      {users.map(renderUser)}
      {dataNonFollowerUser?.loadMore && <LoadingItem />}
    </div>
  );
};

export default memo(UserFollowers);
