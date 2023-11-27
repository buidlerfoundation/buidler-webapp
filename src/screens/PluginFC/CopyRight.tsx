import React, { memo } from "react";
import styles from "./index.module.scss";
import LogoFC from "shared/SVG/LogoFC";

const CopyRight = () => {
  return (
    <a
      className={styles["copy-right"]}
      href="https://www.farcaster.xyz/"
      target="_blank"
      rel="noreferrer"
    >
      <span className={styles["sub-text"]}>Powered by</span>
      <LogoFC size={15} />
      <span className={styles["main-text"]}>Farcaster</span>
    </a>
  );
};

export default memo(CopyRight);
