import React, { memo } from "react";
import styles from "./index.module.scss";
import Spinner from "shared/Spinner";

const Loading = () => {
  return (
    <div className={styles.loading}>
      <Spinner />
    </div>
  );
};

export default memo(Loading);
