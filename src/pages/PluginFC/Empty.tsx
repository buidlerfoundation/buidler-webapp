import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import IconPlus from "shared/SVG/IconPlus";

const Empty = () => {
  const onCreateCastClick = useCallback(() => {
    window.top?.postMessage(
      { type: "b-fc-plugin-open-compose" },
      { targetOrigin: "*" }
    );
  }, []);
  return (
    <div className={styles["empty-state"]}>
      <div className={styles["empty-body"]}>
        <span>No post has been created yet.</span>
        <div className={styles.actions}>
          <div className={styles["btn-cast"]} onClick={onCreateCastClick}>
            <IconPlus fill="white" style={{ marginRight: 10 }} />
            <span>New post</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Empty);
