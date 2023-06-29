import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import MessageChatBox from "shared/MessageChatBox";
import useChannel from "hooks/useChannel";
import useCurrentCommunity from "hooks/useCurrentCommunity";

const Home = () => {
  const channel = useChannel();
  const community = useCurrentCommunity();
  const iframeRef =
    useRef<HTMLIFrameElement>() as React.MutableRefObject<HTMLIFrameElement>;
  const [loadingIframe, setLoadingIframe] = useState(false);
  const onLoad = useCallback(() => {
    setLoadingIframe(false);
  }, []);
  useEffect(() => {
    if (channel?.channel_name && community?.community_name) {
      document.title = `${community?.community_name} • #${channel?.channel_name} | Buidler`;
    }
  }, [channel?.channel_name, community?.community_name]);
  return (
    <>
      <div className={styles["content-side"]}>
        {channel?.dapp_integration_url && (
          <iframe
            ref={iframeRef}
            src={channel?.dapp_integration_url}
            className={styles["dapp-iframe-full"]}
            title="dapp-browser"
            loading="lazy"
            onLoad={onLoad}
            style={{
              opacity: loadingIframe ? 0 : 1,
            }}
            allow="camera; microphone; clipboard-read; clipboard-write; display-capture"
            allowFullScreen
          />
        )}
      </div>
      <div className={styles["chat-box__container"]}>
        <MessageChatBox hideCommunity />
      </div>
    </>
  );
};

export default memo(Home);
