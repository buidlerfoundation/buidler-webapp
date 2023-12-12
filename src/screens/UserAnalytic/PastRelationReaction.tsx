import { IPagingData, IPastRelationReactionData } from "models/FC";
import React, { memo } from "react";
import CastItem from "shared/CastItem";
import PastReactionItem from "shared/PastReactionItem";

interface IPastRelationReaction {
  data?: IPagingData<IPastRelationReactionData>;
  name?: string;
}

const PastRelationReaction = ({ data, name }: IPastRelationReaction) => {
  if (!data || data.loading || data.data.length === 0) return null;
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
