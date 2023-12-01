import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { IActivityFilter } from "models/FC";
import { Tooltip } from "@mui/material";
import { getTimeRange } from "utils/DateUtils";
import useAppDispatch from "hooks/useAppDispatch";
import { INSIGHTS_ACTIONS } from "reducers/InsightReducers";
import useAppSelector from "hooks/useAppSelector";

interface IFilterItem {
  item: IActivityFilter;
}

const FilterItem = ({ item }: IFilterItem) => {
  const dispatch = useAppDispatch();
  const period = useAppSelector((state) => state.insights.period);
  const active = useMemo(() => period === item.period, [item.period, period]);
  const timeRange = useMemo(() => getTimeRange(item.period), [item.period]);
  const onClick = useCallback(() => {
    dispatch(INSIGHTS_ACTIONS.updatePeriod(item.period));
  }, [dispatch, item.period]);
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
