import React, { memo } from "react";
import styles from "./index.module.scss";
import MessageChatBox from "shared/MessageChatBox";

const Home = () => {
  return (
    <>
      <div className={styles["content-side"]}></div>
      <div className={styles["chat-box__container"]}>
        <MessageChatBox />
      </div>
    </>
  );
};

export default memo(Home);
