import React, { memo } from "react";
import styles from "./index.module.scss";
import MessageChatBox from "shared/MessageChatBox";

const Panel = () => {
  return (
    <div className={styles.container}>
      <MessageChatBox />
    </div>
  );
};

export default memo(Panel);
