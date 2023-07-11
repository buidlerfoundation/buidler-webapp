import React, { memo } from "react";
import styles from "./index.module.scss";
import { Skeleton } from "@mui/material";

const Loading = () => {
  return (
    <div className={styles.loading}>
      <Skeleton
        variant="rectangular"
        style={{ margin: "0 10px", borderRadius: 10 }}
        width={255}
        height="100%"
      />
      <Skeleton
        variant="rectangular"
        style={{ borderRadius: 10, flex: 1 }}
        height="100%"
      />
      <Skeleton
        variant="rectangular"
        style={{ margin: "0 10px", borderRadius: 10 }}
        width={390}
        height="100%"
      />
    </div>
  );
};

export default memo(Loading);
