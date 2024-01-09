"use client";

import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import { ICommunityNotePath, IUserInsightTab } from "models/FC";
import { usePathname } from "next/navigation";
import FilterItem from "shared/FilterItem";
import useCommunityNoteFilters from "hooks/useCommunityNoteFilters";
import IconPlus from "shared/SVG/IconPlus";

interface INoteFeedWrapper {
  children: React.ReactNode;
}

const NoteFeedWrapper = ({ children }: INoteFeedWrapper) => {
  const filters = useCommunityNoteFilters();
  const pathname = usePathname();
  const renderFilter = useCallback(
    (item: IUserInsightTab<ICommunityNotePath>) => (
      <FilterItem
        label={item.label}
        path={item.path}
        key={item.path}
        active={pathname === item.path}
      />
    ),
    [pathname]
  );
  const onCreateReport = useCallback(() => {}, []);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Community Notes</div>
        <nav className={styles["filter-head"]}>
          {filters.map(renderFilter)}
          <div className={styles["btn-report"]} onClick={onCreateReport}>
            <IconPlus fill="white" style={{ marginRight: 10 }} />
            <span>New report</span>
          </div>
        </nav>
      </div>
      {children}
    </div>
  );
};

export default memo(NoteFeedWrapper);