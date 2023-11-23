import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";
import { IFCUser, IPagingData } from "models/FC";
import TopInteractionTable from "./TopInteractionTable";

interface ITopInteractions {
  data?: IPagingData<IFCUser>;
}

const TopInteractions = ({ data }: ITopInteractions) => {
  const users = useMemo(() => data?.data || [], [data?.data]);
  if (users.length === 0) return null;
  return (
    <div className={styles["top-interaction-wrap"]}>
      <span className={styles.label}>Top interactions</span>
      <TopInteractionTable data={users} />
    </div>
  );
};

export default memo(TopInteractions);
