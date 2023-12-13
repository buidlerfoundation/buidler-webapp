import { ICast, IPagingData } from "models/FC";
import React, { memo } from "react";
import CastItem from "shared/CastItem";
import styles from "./index.module.scss";

interface IPastRelationCast {
  data?: IPagingData<ICast>;
  empty: string;
}

const PastRelationCast = ({ data, empty }: IPastRelationCast) => {
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
        gap: 15,
      }}
    >
      {data.data.slice(0, 3).map((el) => (
        <CastItem
          cast={el}
          key={el.hash}
          homeFeed
          hideAttachment
          openWarpcast
        />
      ))}
    </div>
  );
};

export default memo(PastRelationCast);
