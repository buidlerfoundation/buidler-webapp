"use client";

import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import useFeedFilters from "hooks/useFeedFilters";
import { IFCFilterType } from "models/FC";
import { usePathname } from "next/navigation";
import FilterItem from "shared/FilterItem";

interface IHomeFeedWrapper {
  children: React.ReactNode;
}

const HomeFeedWrapper = ({ children }: IHomeFeedWrapper) => {
  const filters = useFeedFilters();
  const pathname = usePathname();
  const renderFilter = useCallback(
    (item: IFCFilterType) => (
      <FilterItem item={item} key={item.id} active={pathname === item.path} />
    ),
    [pathname]
  );
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Hacker News on Farcaster</div>
        <nav className={styles["filter-head"]}>{filters.map(renderFilter)}</nav>
      </div>
      {children}
    </div>
  );
};

export default memo(HomeFeedWrapper);
