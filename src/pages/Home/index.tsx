import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import MessageChatBox from "shared/MessageChatBox";
import useChannel from "hooks/useChannel";
import useCurrentCommunity from "hooks/useCurrentCommunity";
import { CircularProgress } from "@mui/material";
import IconCornerBottomLeft from "shared/SVG/IconCornerBottomLeft";
import IconCornerBottomRight from "shared/SVG/IconCornerBottomRight";
import IconCornerTopLeft from "shared/SVG/IconCornerTopLeft";
import IconCornerTopRight from "shared/SVG/IconCornerTopRight";

const Home = () => {
  const channel = useChannel();
  const community = useCurrentCommunity();
  const iframeRef =
    useRef<HTMLIFrameElement>() as React.MutableRefObject<HTMLIFrameElement>;
  const [loadingIframe, setLoadingIframe] = useState(false);
  const onLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    setLoadingIframe(false);
  }, []);
  useEffect(() => {
    if (channel?.dapp_integration_url) {
      setLoadingIframe(true);
    }
  }, [channel?.dapp_integration_url]);
  useEffect(() => {
    if (channel?.channel_name && community?.community_name) {
      document.title = `${community?.community_name} • #${channel?.channel_name} | Buidler`;
    }
  }, [channel?.channel_name, community?.community_name]);
  return (
    <>
      <div className={`${styles["content-side"]} hide-scroll-bar`}>
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
        {loadingIframe && (
          <div className={styles["loading"]}>
            <CircularProgress size={30} color="inherit" />
          </div>
        )}
        <IconCornerBottomLeft />
        <IconCornerBottomRight />
        <IconCornerTopLeft />
        <IconCornerTopRight />
        <div className={styles["space-bottom"]} />
      </div>
      <div className={styles["chat-box__container"]}>
        <div className={styles["chat-box"]}>
          <MessageChatBox />
        </div>
      </div>
    </>
  );
};

export default memo(Home);
