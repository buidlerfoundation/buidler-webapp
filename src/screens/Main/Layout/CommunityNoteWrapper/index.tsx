"use client";

import React, { memo } from "react";
import styles from "./index.module.scss";

interface ICommunityNoteWrapper {
  children: React.ReactNode;
}

const CommunityNoteWrapper = ({ children }: ICommunityNoteWrapper) => {
  return <div className={styles.container}>{children}</div>;
};

export default memo(CommunityNoteWrapper);
