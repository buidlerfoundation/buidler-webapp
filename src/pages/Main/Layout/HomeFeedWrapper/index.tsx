import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import useFeedFilters from "hooks/useFeedFilters";
import { IFCFilterType } from "models/FC";
import { Link, Outlet, useLocation } from "react-router-dom";

interface IFilterItem {
  item: IFCFilterType;
  active: boolean;
}

const FilterItem = ({ item, active }: IFilterItem) => {
  return (
    <Link
      className={`${styles["filter-item"]} ${
        active ? styles["filter-active"] : ""
      }`}
      to={item.path}
    >
      {item.label}
    </Link>
  );
};

const FilterItemMemo = memo(FilterItem);

const HomeFeedWrapper = () => {
  const filters = useFeedFilters();
  const location = useLocation();
  const renderFilter = useCallback(
    (item: IFCFilterType) => (
      <FilterItemMemo
        item={item}
        key={item.id}
        active={location.pathname === item.path}
      />
    ),
    [location.pathname]
  );
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Home</div>
        <nav className={styles["filter-head"]}>{filters.map(renderFilter)}</nav>
      </div>
      <Outlet />
    </div>
  );
};

export default memo(HomeFeedWrapper);
