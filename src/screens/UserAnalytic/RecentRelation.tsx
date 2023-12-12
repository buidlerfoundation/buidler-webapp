import { ICast, IPagingData, IPastRelationReactionData } from "models/FC";
import React, { memo, useCallback, useMemo, useState } from "react";
import styles from "./index.module.scss";
import CastItem from "shared/CastItem";
import Link from "next/link";
import PastRelationCast from "./PastRelationCast";
import PastRelationReaction from "./PastRelationReaction";

interface IRecentRelation {
  dataMention?: IPagingData<ICast>;
  dataReply?: IPagingData<ICast>;
  dataReaction?: IPagingData<IPastRelationReactionData>;
  name?: string;
}

const RecentRelation = ({
  dataMention,
  dataReply,
  dataReaction,
  name,
}: IRecentRelation) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabs = useMemo(() => ["Mentions", "Replies", "Reactions"], []);
  const renderBody = useCallback(() => {
    if (activeTabIndex === 0) return <PastRelationCast data={dataMention} />;
    if (activeTabIndex === 1) return <PastRelationCast data={dataReply} />;
    return <PastRelationReaction data={dataReaction} name={name} />;
  }, [activeTabIndex, dataMention, dataReaction, dataReply, name]);
  if (
    !dataMention ||
    !dataReply ||
    !dataReaction ||
    dataMention.loading ||
    dataReply.loading ||
    dataReaction.loading
  )
    return null;
  return (
    <div
      className={styles["chart-item"]}
      style={{ height: "unset", gap: "unset" }}
    >
      <div className={styles.tabs}>
        {tabs.map((el, index) => (
          <div
            className={`${styles["tab-item"]} ${
              activeTabIndex === index ? styles["tab-item-active"] : ""
            }`}
            key={el}
            onClick={() => setActiveTabIndex(index)}
          >
            {el}
          </div>
        ))}
      </div>
      {renderBody()}
    </div>
  );
};

export default memo(RecentRelation);
