import React, { memo, useEffect } from "react";
import styles from "./index.module.scss";
import MessageChatBox from "shared/MessageChatBox";
import useChannel from "hooks/useChannel";
import useAppDispatch from "hooks/useAppDispatch";
import { getStories } from "reducers/PinPostReducers";

const Panel = () => {
  const dispatch = useAppDispatch();
  const channel = useChannel();
  useEffect(() => {
    if (channel?.dapp_integration_url) {
      dispatch(getStories({ url: channel?.dapp_integration_url }));
    }
  }, [channel?.dapp_integration_url, dispatch]);
  return (
    <div className={styles.container}>
      <MessageChatBox />
    </div>
  );
};

export default memo(Panel);
