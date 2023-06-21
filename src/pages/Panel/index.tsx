import React, { memo } from "react";
import styles from "./index.module.scss";
import MessageChatBox from "shared/MessageChatBox";

const Panel = () => {
  return (
    <main>
      <div className={styles.container}>
        <MessageChatBox />
      </div>
    </main>
  );
};

export default memo(Panel);
