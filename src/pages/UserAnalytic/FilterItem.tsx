import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { useSearchParams } from "react-router-dom";
import { ActivityPeriod, IActivityFilter } from "models/FC";
import { Tooltip } from "@mui/material";
import { getTimeRange } from "utils/DateUtils";

interface IFilterItem {
  item: IActivityFilter;
}

const FilterItem = ({ item }: IFilterItem) => {
  const [search, setSearch] = useSearchParams();
  const period = useMemo(
    () => (search.get("period") || "7d") as ActivityPeriod,
    [search]
  );
  const active = useMemo(() => period === item.period, [item.period, period]);
  const timeRange = useMemo(() => getTimeRange(item.period), [item.period]);
  const onClick = useCallback(() => {
    setSearch({ period: item.period });
  }, [item.period, setSearch]);
  return (
    <Tooltip title={timeRange}>
      <div
        className={`${styles["filter-item"]} ${active ? styles.active : ""}`}
        onClick={onClick}
      >
        {item.label}
      </div>
    </Tooltip>
  );
};

export default memo(FilterItem);
