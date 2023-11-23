import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { IActivity } from "models/FC";
import IconArrowBack from "shared/SVG/IconArrowBack";
import IconCaretDown from "shared/SVG/FC/IconCaretDown";
import { formatNumber } from "helpers/StringHelper";
import numeral from "numeral";

interface IActivityItem {
  activity?: IActivity;
  label: string;
  showSuffix?: boolean;
  loading?: boolean;
}

const ActivityItem = ({
  activity,
  label,
  showSuffix,
  loading,
}: IActivityItem) => {
  const changed = useMemo(() => activity?.changed || 0, [activity?.changed]);
  const isDecrease = useMemo(() => changed < 0, [changed]);
  const isIncrease = useMemo(() => changed > 0, [changed]);
  const isEqual = useMemo(() => changed === 0, [changed]);
  const color = useMemo(
    () => (isIncrease ? "var(--color-success)" : "var(--color-urgent)"),
    [isIncrease]
  );
  const total = useMemo(() => activity?.total || 0, [activity?.total]);
  const displayChanged = useMemo(() => {
    if (!changed) return "0";
    const absChanged = Math.abs(changed);
    return `${numeral(absChanged * 100).format("0.[0][0]")}%`;
  }, [changed]);
  const suffix = useMemo(() => {
    if (!total || !showSuffix) return "";
    if (total > 0) return "+";
    return "-";
  }, [total, showSuffix]);
  const displayTotal = useMemo(() => {
    if (loading) return "";
    const absTotal = Math.abs(total);
    return formatNumber(absTotal) || "0";
  }, [loading, total]);
  const renderChangeIcon = useCallback(() => {
    if (isEqual) return null;
    if (isDecrease)
      return <IconCaretDown fill="var(--color-urgent)" size={15} />;
    if (isIncrease)
      return (
        <IconCaretDown
          style={{ rotate: "180deg" }}
          fill="var(--color-success)"
          size={15}
        />
      );
  }, [isDecrease, isEqual, isIncrease]);
  return (
    <div className={styles["activity-item"]}>
      <span className={styles["activity-label"]}>{label}</span>
      <div className={styles["activity-total"]}>
        {suffix}
        {displayTotal}
      </div>
      <div
        className={styles["activity-changed"]}
        style={!changed ? { opacity: 0 } : {}}
      >
        {renderChangeIcon()}
        <span style={{ color }}>{displayChanged}</span>
      </div>
    </div>
  );
};

export default memo(ActivityItem);
