import { ICast, IPagingData } from "models/FC";
import React, { memo } from "react";
import CastItem from "shared/CastItem";

interface IPastRelationCast {
  data?: IPagingData<ICast>;
}

const PastRelationCast = ({ data }: IPastRelationCast) => {
  if (!data || data.loading || data.data.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: 15,
        gap: 15,
      }}
    >
      {data.data.slice(0, 3).map((el) => (
        <CastItem cast={el} key={el.hash} homeFeed hideAttachment openWarpcast />
      ))}
    </div>
  );
};

export default memo(PastRelationCast);
