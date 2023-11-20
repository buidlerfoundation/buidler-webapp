import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { useParams } from "react-router-dom";
import useDataNonFollowerUser from "hooks/useDataNonFollowerUser";
import { IFCUser } from "models/FC";
import UserItem from "shared/UserItem";

const UserFollowers = () => {
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
  return <div className={styles.container}>{users.map(renderUser)}</div>;
};

export default memo(UserFollowers);
