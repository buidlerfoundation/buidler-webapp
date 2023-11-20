import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";
import { IFCUser, IPagingData } from "models/FC";
import ImageView from "shared/ImageView";
import { Link } from "react-router-dom";
import { Tooltip } from "@mui/material";
import { humanFormatNumber } from "helpers/StringHelper";
import useIsMobile from "hooks/useIsMobile";

interface INonFollowerUser {
  data?: IPagingData<IFCUser>;
  onViewAll: () => void;
}

const NonFollowerUser = ({ data, onViewAll }: INonFollowerUser) => {
  const isMobile = useIsMobile();
  const users = useMemo(
    () => data?.data?.slice(0, isMobile ? 5 : 9) || [],
    [data?.data, isMobile]
  );
  const totalMore = useMemo(
    () => (data?.total || 0) - users.length,
    [data?.total, users.length]
  );
  if (users.length === 0) return null;
  return (
    <div className={styles["non-follow-wrap"]}>
      <div className={styles["non-follow-head"]}>
        <span className={styles.label}>Non-Followers</span>
        <div className={styles["btn-view-all"]} onClick={onViewAll}>
          View all
        </div>
      </div>
      <div className={styles["list-non-follow"]}>
        {users.map((el) => (
          <Tooltip title={el.username} key={el.fid} placement="top">
            <Link to={`/insights/${el.fid}`} state={{ goBack: true }}>
              <ImageView
                alt="avatar"
                className={styles.avatar}
                src={el?.pfp?.url}
              />
            </Link>
          </Tooltip>
        ))}
        {totalMore > 0 && (
          <div
            className={`${styles.avatar} ${styles["btn-more"]}`}
            onClick={onViewAll}
            key="load-more"
          >
            +{humanFormatNumber(totalMore)}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(NonFollowerUser);
