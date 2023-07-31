import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";
import { getLogoFromUrl } from "helpers/LinkHelper";

interface ITeamItemLoading {
  url: string;
}

const TeamItemLoading = ({ url }: ITeamItemLoading) => {
  const logo = useMemo(() => getLogoFromUrl(url), [url]);
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
