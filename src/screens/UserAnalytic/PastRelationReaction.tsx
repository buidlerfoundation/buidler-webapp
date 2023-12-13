import { IPagingData, IPastRelationReactionData } from "models/FC";
import React, { memo } from "react";
import PastReactionItem from "shared/PastReactionItem";
import styles from "./index.module.scss";

interface IPastRelationReaction {
  data?: IPagingData<IPastRelationReactionData>;
  name?: string;
  empty: string;
}

const PastRelationReaction = ({ data, name, empty }: IPastRelationReaction) => {
  if (!data || data.loading) return null;
  if (!data.loading && data.data.length === 0) {
    return <div className={styles["empty-box"]}>{empty}</div>;
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: 15,
      }}
    >
      {data.data.slice(0, 10).map((el) => (
        <PastReactionItem
          item={el}
          key={`${el.reaction_type}-${el.hash}`}
          name={name}
        />
      ))}
    </div>
  );
};

export default memo(PastRelationReaction);
