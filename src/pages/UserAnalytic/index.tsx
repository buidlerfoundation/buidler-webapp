import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";
import { useParams, useSearchParams } from "react-router-dom";
import useFCUserByName from "hooks/useFCUserByName";
import UserInfo from "./UserInfo";
import Analytics from "./Analytics";
import { ActivityPeriod } from "models/FC";

const UserAnalytic = () => {
  const [search] = useSearchParams();
  const params = useParams<{ username: string }>();
  const username = useMemo(() => params?.username, [params?.username]);
  const fcUser = useFCUserByName(username);
  const period = useMemo(
    () => (search.get("period") || "7d") as ActivityPeriod,
    [search]
  );
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <UserInfo user={fcUser?.data} loading={fcUser?.loading} />
        <Analytics fid={fcUser?.data?.fid} period={period} />
      </div>
    </div>
  );
};

export default memo(UserAnalytic);
