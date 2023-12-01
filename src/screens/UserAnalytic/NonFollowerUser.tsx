import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { IFCUser, IPagingData } from "models/FC";
import ImageView from "shared/ImageView";
import { Tooltip } from "@mui/material";
import { humanFormatNumber } from "helpers/StringHelper";
import useIsMobile from "hooks/useIsMobile";
import IconInformation from "shared/SVG/IconInformation";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface INonFollowerUser {
  data?: IPagingData<IFCUser>;
  onViewAll: () => void;
}

const NonFollowerUser = ({ data, onViewAll }: INonFollowerUser) => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isPlugin = useMemo(
    () => pathname.includes("/plugin-fc/insights"),
    [pathname]
  );
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={styles.label}>Non-Followers</span>
          <Tooltip
            title="Users you are following, but who are not following you back."
            placement="top"
          >
            <div className="center">
              <IconInformation />
            </div>
          </Tooltip>
        </div>
        <div className={styles["btn-view-all"]} onClick={onViewAll}>
          View all
        </div>
      </div>
      <div className={styles["list-non-follow"]}>
        {users.map((el) => (
          <Tooltip title={el.username} key={el.fid} placement="top">
            <Link
              href={`/insights/${el.username}`}
              onClick={(e) => {
                if (isPlugin) {
                  e.preventDefault();
                  window.top?.postMessage(
                    {
                      type: "b-fc-plugin-update-current-url",
                      payload: `https://warpcast.com/${el.username}`,
                    },
                    { targetOrigin: "*" }
                  );
                }
              }}
            >
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
