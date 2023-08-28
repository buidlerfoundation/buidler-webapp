import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";

interface ITeamItemLoading {
  url: string;
}

const TeamItemLoading = ({ url }: ITeamItemLoading) => {
  const communityDisplayName = useMemo(() => {
    const parsed = new URL(url);
    return parsed.host.replace("www.", "");
  }, [url]);
  return (
    <div className={`${styles["team-item"]} ${styles["team-selected"]}`}>
      <div className={styles["team-icon-mini__wrap"]}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            backgroundColor: "var(--color-stroke)",
          }}
        />
      </div>
      <span className={styles["team-name"]}>{communityDisplayName}</span>
    </div>
  );
};

export default memo(TeamItemLoading);
