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
import useAppDispatch from "hooks/useAppDispatch";
import { openNewTabFromIframe } from "reducers/UserActions";
import { useNavigate } from "react-router-dom";
import { getStories } from "reducers/PinPostReducers";
import Loading from "./Loading";

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const channel = useChannel();
  const community = useCurrentCommunity();
  const iframeRef =
    useRef<HTMLIFrameElement>() as React.MutableRefObject<HTMLIFrameElement>;
  const [loadingIframe, setLoadingIframe] = useState(false);
  const [openNewChannel, setOpenNewChannel] = useState(false);
  const [loadingOpenNewChannel, setLoadingOpenNewChannel] = useState(false);
  const onLoad = useCallback(
    (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
      setLoadingIframe(false);
      setOpenNewChannel(false);
    },
    []
  );
  const onError = useCallback((e: any) => {
    setLoadingIframe(false);
    setOpenNewChannel(false);
  }, []);
  const handleOpenNewTab = useCallback(
    async (url: string) => {
      setOpenNewChannel(true);
      setLoadingIframe(true);
      setLoadingOpenNewChannel(true);
      const res = await dispatch(openNewTabFromIframe({ url })).unwrap();
      if (res) {
        const { channel, community } = res;
        navigate(`/channels/${community.community_id}/${channel.channel_id}`, {
          replace: true,
        });
      }
      setTimeout(() => {
        setLoadingIframe(false);
        setLoadingOpenNewChannel(false);
      }, 500);
    },
    [dispatch, navigate]
  );
  useEffect(() => {
    const messageListener = (e: any) => {
      if (e.data.type === "frame-update") {
        if (
          channel?.dapp_integration_url &&
          e.data?.frame?.url !== channel?.dapp_integration_url &&
          !openNewChannel
        ) {
          const url = new URL(channel?.dapp_integration_url);
          const newUrl = new URL(e.data?.frame?.url);
          if (
            (e.data?.frame?.url?.includes(url.origin) &&
              newUrl.pathname !== url.pathname) ||
            !e.data?.frame?.url?.includes(url.origin)
          ) {
            handleOpenNewTab(e.data?.frame?.url);
          }
        }
      }
    };
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [channel?.dapp_integration_url, handleOpenNewTab, openNewChannel]);
  useEffect(() => {
    if (channel?.display_channel_url) {
      setOpenNewChannel(true);
      setLoadingIframe(true);
      dispatch(getStories({ url: channel?.display_channel_url }));
    }
  }, [channel?.display_channel_url, dispatch]);
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
            id="buidler-iframe"
            ref={iframeRef}
            src={channel?.dapp_integration_url}
            className={styles["dapp-iframe-full"]}
            title="dapp-browser"
            onLoad={onLoad}
            onError={onError}
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
      {loadingOpenNewChannel && <Loading />}
    </>
  );
};

export default memo(Home);
