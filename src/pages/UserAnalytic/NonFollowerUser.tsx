import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";
import { IFCUser, IPagingData } from "models/FC";
import ImageView from "shared/ImageView";
import { Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";

interface INonFollowerUser {
  data?: IPagingData<IFCUser>;
  onLoadMore: () => void;
}

const NonFollowerUser = ({ data, onLoadMore }: INonFollowerUser) => {
  const users = useMemo(() => data?.data || [], [data?.data]);
  if (users.length === 0) return null;
  return (
    <div className={styles["non-follow-wrap"]}>
      <span className={styles.label}>People who don't follow back</span>
      <div className={styles["list-non-follow"]}>
        {users.map((el) => (
          <Link to={`/analytic/${el.fid}`} state={{ fromNonFollower: true }}>
            <ImageView
              alt="avatar"
              className={styles.avatar}
              src={el?.pfp?.url}
              key={el.fid}
            />
          </Link>
        ))}
        <div
          className={`${styles.avatar} ${styles["btn-more"]}`}
          onClick={onLoadMore}
          key="load-more"
        >
          {data?.loadMore ? (
            <CircularProgress color="inherit" size={15} />
          ) : (
            "+10"
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(NonFollowerUser);
