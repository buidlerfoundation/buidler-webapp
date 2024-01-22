"use client";

import React, { memo } from "react";
import styles from "./index.module.scss";
import FilterItem from "shared/FilterItem";
import { usePathname } from "next/navigation";

interface IMyContributorWrapper {
  children: React.ReactNode;
}

const MyContributorWrapper = ({ children }: IMyContributorWrapper) => {
  const pathname = usePathname();
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>My Contribution</div>
        <nav className={styles["filter-head"]}>
          <FilterItem
            path="/community-notes/contribute/notes"
            label="Notes"
            active={pathname === "/community-notes/contribute/notes"}
          />
          <FilterItem
            path="/community-notes/contribute/ratings"
            label="Rating"
            active={pathname === "/community-notes/contribute/ratings"}
          />
        </nav>
      </div>
      {children}
    </div>
  );
};

export default memo(MyContributorWrapper);
