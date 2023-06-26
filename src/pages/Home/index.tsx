import React, { memo, useCallback, useRef, useState } from "react";
import styles from "./index.module.scss";
import MessageChatBox from "shared/MessageChatBox";
import useChannel from "hooks/useChannel";

const Home = () => {
  const channel = useChannel();
  const iframeRef =
    useRef<HTMLIFrameElement>() as React.MutableRefObject<HTMLIFrameElement>;
  const [loadingIframe, setLoadingIframe] = useState(false);
  const onLoad = useCallback(() => {
    setLoadingIframe(false);
  }, []);
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
