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
    if (channel?.display_channel_url) {
      dispatch(getStories({ url: channel?.display_channel_url }));
    }
  }, [channel?.display_channel_url, dispatch]);
  return (
    <div className={styles.container}>
      <MessageChatBox />
    </div>
  );
};

export default memo(Panel);
