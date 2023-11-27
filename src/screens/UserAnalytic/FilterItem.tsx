import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { ActivityPeriod, IActivityFilter } from "models/FC";
import { Tooltip } from "@mui/material";
import { getTimeRange } from "utils/DateUtils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface IFilterItem {
  item: IActivityFilter;
}

const FilterItem = ({ item }: IFilterItem) => {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const period = useMemo(
    () => (search?.get("period") || "7d") as ActivityPeriod,
    [search]
  );
  const active = useMemo(() => period === item.period, [item.period, period]);
  const timeRange = useMemo(() => getTimeRange(item.period), [item.period]);
  const onClick = useCallback(() => {
    router.replace(`${pathname}?period=${item.period}`);
  }, [item.period, pathname, router]);
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
