import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";

interface ITeamItemLoading {
  url: string;
}

const TeamItemLoading = ({ url }: ITeamItemLoading) => {
  const logo = useMemo(
    () =>
      `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=256`,
    [url]
  );
  const communityDisplayName = useMemo(() => {
    const parsed = new URL(url);
    return parsed.host;
  }, [url]);
  return (
    <div className={`${styles["team-item"]} ${styles["team-selected"]}`}>
      <div className={styles["team-icon-mini__wrap"]}>
        <img
          alt=""
          src={logo}
          style={{ width: 20, height: 20, borderRadius: 5 }}
        />
      </div>
      <span className={styles["team-name"]}>{communityDisplayName}</span>
    </div>
  );
};

export default memo(TeamItemLoading);
