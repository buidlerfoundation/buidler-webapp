"use client";

import React, { memo } from "react";
import styles from "./index.module.scss";
import { usePathname } from "next/navigation";
import useCommunityNoteFilters from "hooks/useCommunityNoteFilters";
import Link from "next/link";

interface ICommunityNoteWrapper {
  children: React.ReactNode;
}

const CommunityNoteWrapper = ({ children }: ICommunityNoteWrapper) => {
  const filters = useCommunityNoteFilters();
  const pathname = usePathname();
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.head}>Community Notes</div>
        <div className={styles.tabs}>
          {filters?.map((el) => (
            <Link
              href={`/plugin-fc${el.path}`}
              key={el.path}
              className={`${styles["tab-item"]} ${
                pathname === `/plugin-fc${el.path}` ? styles.active : ""
              }`}
              replace
            >
              {el.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
};

export default memo(CommunityNoteWrapper);
