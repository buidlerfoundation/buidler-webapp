"use client";

import React, { memo } from "react";
import styles from "./index.module.scss";

interface IMyContributorWrapper {
  children: React.ReactNode;
}

const MyContributorWrapper = ({ children }: IMyContributorWrapper) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>My Contribution.</div>
      </div>
      {children}
    </div>
  );
};

export default memo(MyContributorWrapper);
