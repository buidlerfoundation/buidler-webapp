"use client"

import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import useFeedFilters from "hooks/useFeedFilters";
import { IFCFilterType } from "models/FC";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      href={item.path}
    >
      {item.label}
    </Link>
  );
};

const FilterItemMemo = memo(FilterItem);

interface IHomeFeedWrapper {
  children: React.ReactNode;
}

const HomeFeedWrapper = ({ children }: IHomeFeedWrapper) => {
  const filters = useFeedFilters();
  const pathname = usePathname();
  const renderFilter = useCallback(
    (item: IFCFilterType) => (
      <FilterItemMemo
        item={item}
        key={item.id}
        active={pathname === item.path}
      />
    ),
    [pathname]
  );
  const title = useMemo(() => "Hacker News on Farcaster", []);
  useEffect(() => {
    if (title) {
      document.title = `${title} | Buidler`;
    }
  }, [title]);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <nav className={styles["filter-head"]}>{filters.map(renderFilter)}</nav>
      </div>
      {children}
    </div>
  );
};

export default memo(HomeFeedWrapper);
