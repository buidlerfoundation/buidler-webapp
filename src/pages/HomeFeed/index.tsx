import React, { memo, useCallback, useMemo, useState } from "react";
import styles from "./index.module.scss";
import { IFCFilterType } from "models/FC";
import FeedItem from "shared/FeedItem";

interface IFilterItem {
  item: IFCFilterType;
  onClick: (item: IFCFilterType) => void;
  active: boolean;
}

const FilterItem = ({ item, onClick, active }: IFilterItem) => {
  const handleClick = useCallback(() => onClick(item), [item, onClick]);
  return (
    <div
      className={`${styles["filter-item"]} ${
        active ? styles["filter-active"] : ""
      }`}
      onClick={handleClick}
    >
      {item.label}
    </div>
  );
};

const FilterItemMemo = memo(FilterItem);

const HomeFeed = () => {
  const filters = useMemo<IFCFilterType[]>(
    () => [
      { label: "trending", id: "1" },
      { label: "newest", id: "2" },
      { label: "by domain", id: "3" },
    ],
    []
  );
  const [filter, setFilter] = useState(filters[0]);
  const renderFilter = useCallback(
    (item: IFCFilterType) => (
      <FilterItemMemo
        item={item}
        key={item.id}
        onClick={setFilter}
        active={filter.id === item.id}
      />
    ),
    [filter.id]
  );
  return (
    <div className={styles.container}>
      <div className={styles["filter-head"]}>{filters.map(renderFilter)}</div>
      <div className={styles.list}>
        <FeedItem />
      </div>
    </div>
  );
};

export default memo(HomeFeed);
