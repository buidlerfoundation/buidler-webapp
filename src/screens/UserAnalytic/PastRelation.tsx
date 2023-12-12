import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";
import { IPastRelationData } from "models/FC";
import { dateFormatted } from "utils/DateUtils";
import { Tooltip } from "@mui/material";

interface IPastRelation {
  data?: IPastRelationData;
  name?: string;
}

const PastRelation = ({ data, name }: IPastRelation) => {
  const totalLikes = useMemo(() => data?.likes || 0, [data?.likes]);
  const totalRecasts = useMemo(() => data?.recasts || 0, [data?.recasts]);
  const totalReplyCasts = useMemo(
    () => data?.replied_casts || 0,
    [data?.replied_casts]
  );
  const totalMentions = useMemo(() => data?.mentions || 0, [data?.mentions]);
  const since = useMemo(
    () => data?.first_interacted_at || new Date(),
    [data?.first_interacted_at]
  );
  const total = useMemo(() => {
    return totalLikes + totalRecasts + totalReplyCasts + totalMentions;
  }, [totalLikes, totalMentions, totalRecasts, totalReplyCasts]);
  const dataPastRelation = useMemo(
    () => [
      { label: "Replied", color: "rgb(124, 101, 193)", count: totalReplyCasts },
      { label: "Liked", color: "var(--color-mention)", count: totalLikes },
      { label: "Recast", color: "var(--color-recast)", count: totalRecasts },
      { label: "Mentioned", color: "var(--color-blue)", count: totalMentions },
    ],
    [totalLikes, totalMentions, totalRecasts, totalReplyCasts]
  );
  if (!data) return null;
  return (
    <div className={styles["chart-item"]} style={{ height: "unset", gap: 10 }}>
      <div className={styles["label-wrap"]}>
        <span className={styles.label}>Past Interactions</span>
      </div>
      <p className={styles.description}>
        <span className={styles.highlight}>You</span> and{" "}
        <span className={styles.highlight}>{name}</span> have interacted{" "}
        <span className={styles.highlight}>{total} times</span> since{" "}
        {dateFormatted(since, "MMMM DD, YYYY")}
      </p>
      <div className={styles["past-relation-chart"]}>
        {dataPastRelation.map((el) => (
          <Tooltip
            title={`${el.count} ${el.label}`}
            key={el.label}
            placement="top"
          >
            <div
              className={styles["past-relation-item"]}
              style={{
                width: `${Math.round((el.count * 1000) / total) / 10}%`,
                background: el.color,
              }}
            />
          </Tooltip>
        ))}
      </div>
      <div className={styles["past-relation-category"]}>
        {dataPastRelation.map((el) => (
          <div className={styles["category-item"]} key={el.label}>
            <div style={{ width: 10, height: 10, background: el.color }} />
            <span>{el.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(PastRelation);