import React, { memo, useEffect } from "react";
import styles from "./index.module.scss";
import IconBuidlerLogo from "shared/SVG/IconBuidlerLogo";
import Link from "next/link";
import IconGetStarted from "shared/SVG/IconGetStarted";

const WebsiteCommunityNote = () => {
  return (
    <div className={styles.container}>
      <IconBuidlerLogo size={72} style={{ borderRadius: "50%" }} />
      <h1 className={styles.title}>Community notes for the internet</h1>
      <p className={styles.description}>
        A platform that allows everyone to add helpful notes on any link to
        avoid misinformation and earn rewards.
      </p>
      <Link href="/community-notes" className={styles["btn-get-started"]}>
        <span>Get Started</span>
        <IconGetStarted />
      </Link>
      <span className={styles["fee-text"]}>100% free to get started.</span>
    </div>
  );
};

export default memo(WebsiteCommunityNote);
