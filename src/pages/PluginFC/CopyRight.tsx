import React, { memo } from "react";
import styles from "./index.module.scss";
import LogoFC from "shared/SVG/LogoFC";

const CopyRight = () => {
  return (
    <div className={styles["copy-right"]}>
      <span className={styles["sub-text"]}>Powered by</span>
      <LogoFC />
      <span className={styles["main-text"]}>Farcaster</span>
    </div>
  );
};

export default memo(CopyRight);
