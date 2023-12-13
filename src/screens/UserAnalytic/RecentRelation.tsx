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
  currentRelationIndex: number;
  setRelationIndex: React.Dispatch<React.SetStateAction<number>>;
}

const RecentRelation = ({
  dataMention,
  dataReply,
  dataReaction,
  name,
  currentRelationIndex,
  setRelationIndex,
}: IRecentRelation) => {
  const tabs = useMemo(() => ["Mentions", "Replies", "Reactions"], []);
  const renderBody = useCallback(() => {
    if (currentRelationIndex === 0)
      return (
        <PastRelationCast
          data={dataMention}
          empty={`Seems like you and ${name} haven't had any mentions yet.`}
        />
      );
    if (currentRelationIndex === 1)
      return (
        <PastRelationCast
          data={dataReply}
          empty={`Seems like you and ${name} haven't had any replies yet.`}
        />
      );
    return (
      <PastRelationReaction
        data={dataReaction}
        name={name}
        empty={`Seems like you and ${name} haven't had any reactions yet.`}
      />
    );
  }, [currentRelationIndex, dataMention, dataReaction, dataReply, name]);
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
              currentRelationIndex === index ? styles["tab-item-active"] : ""
            }`}
            key={el}
            onClick={() => setRelationIndex(index)}
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
