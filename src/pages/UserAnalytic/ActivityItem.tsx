import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { IActivity } from "models/FC";
import IconArrowBack from "shared/SVG/IconArrowBack";

interface IActivityItem {
  activity?: IActivity;
  label: string;
}

const ActivityItem = ({ activity, label }: IActivityItem) => {
  const changed = useMemo(() => activity?.changed || 0, [activity?.changed]);
  const isDecrease = useMemo(() => changed < 0, [changed]);
  const isIncrease = useMemo(() => changed > 0, [changed]);
  const isEqual = useMemo(() => changed === 0, [changed]);
  const color = useMemo(
    () => (isIncrease ? "var(--color-success)" : "var(--color-urgent)"),
    [isIncrease]
  );
  const total = useMemo(() => activity?.total, [activity?.total]);
  const suffix = useMemo(() => {
    if (!total) return "";
    if (total > 0) return "+";
    return "-";
  }, [total]);
  const renderChangeIcon = useCallback(() => {
    if (isEqual) return null;
    if (isDecrease)
      return (
        <IconArrowBack
          style={{ rotate: "270deg" }}
          fill="var(--color-urgent)"
          width={20}
          height={20}
        />
      );
    if (isIncrease)
      return (
        <IconArrowBack
          style={{ rotate: "90deg" }}
          fill="var(--color-success)"
          width={20}
          height={20}
        />
      );
  }, [isDecrease, isEqual, isIncrease]);
  return (
    <div className={styles["activity-item"]}>
      <span className={styles["activity-label"]}>{label}</span>
      <div className={styles["activity-total"]}>
        {suffix}
        {total}
      </div>
      <div
        className={styles["activity-changed"]}
        style={!changed ? { opacity: 0 } : {}}
      >
        {renderChangeIcon()}
        <span style={{ color }}>{Math.abs(changed)}</span>
      </div>
    </div>
  );
};

export default memo(ActivityItem);
