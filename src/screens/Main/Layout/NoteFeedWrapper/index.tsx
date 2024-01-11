"use client";

import React, { memo } from "react";
import styles from "./index.module.scss";

interface INoteFeedWrapper {
  children: React.ReactNode;
}

const NoteFeedWrapper = ({ children }: INoteFeedWrapper) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Community Notes for the internet.</div>
      </div>
      {children}
    </div>
  );
};

export default memo(NoteFeedWrapper);
