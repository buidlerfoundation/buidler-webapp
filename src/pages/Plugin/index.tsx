import React, {
  useState,
  useCallback,
  useEffect,
  CSSProperties,
  memo,
} from "react";
import MessageChatBox from "shared/MessageChatBox";
import styles from "./index.module.scss";
import usePluginOpen from "hooks/usePluginOpen";
import useAppDispatch from "hooks/useAppDispatch";
import { OUTSIDE_ACTIONS } from "reducers/OutsideReducers";
import { getDataFromExternalUrl } from "reducers/UserActions";
import { useNavigate } from "react-router-dom";
import useOutsideLoading from "hooks/useOutsideLoading";
import useChannel from "hooks/useChannel";
import { getStories } from "reducers/PinPostReducers";
import useShowPlugin from "hooks/useShowPlugin";

const Plugin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isShowPlugin = useShowPlugin();
  const pluginOpen = usePluginOpen();
  const loading = useOutsideLoading();
  const channel = useChannel();
  const [style, setStyle] = useState<CSSProperties>({ height: "auto" });
  const toggle = useCallback(
    () => dispatch(OUTSIDE_ACTIONS.toggle()),
    [dispatch]
  );
  useEffect(() => {
    if (isShowPlugin) {
      window.parent.postMessage("show-plugin", "*");
    }
  }, [isShowPlugin]);
  useEffect(() => {
    if (channel?.display_channel_url) {
      dispatch(getStories({ url: channel?.display_channel_url }));
    }
  }, [channel?.display_channel_url, dispatch]);
  useEffect(() => {
    if (pluginOpen) {
      setStyle({
        height: "100%",
      });
      window.parent.postMessage("open-plugin", "*");
    } else {
      setTimeout(() => {
        setStyle({ height: "auto" });
        window.parent.postMessage("close-plugin", "*");
      }, 290);
    }
  }, [pluginOpen]);
  useEffect(() => {
    const messageListener = (
      e: MessageEvent<{ type: string; payload: any }>
    ) => {
      if (typeof e.data !== "object") return;
      if (!e.data.type) return;
      const { type, payload } = e.data;
      if (type === "toggle-plugin") {
        toggle();
      }
      if (type === "update-external" && payload) {
        dispatch(getDataFromExternalUrl({ url: payload }))
          .unwrap()
          .then((res) => {
            if (res) {
              const { community, channel } = res;
              const path = `/plugin/${community.community_id}/${channel.channel_id}`;
              navigate(path, { replace: true });
            }
          });
      }
    };
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, toggle]);
  return (
    <div className={styles.container} style={style}>
      <div
        className={`${styles["b-root-chat"]} ${
          pluginOpen ? styles["b-root-chat-on"] : styles["b-root-chat-off"]
        }`}
      >
        <MessageChatBox toggleOutside={toggle} contentLoading={loading} />
      </div>
    </div>
  );
};

export default memo(Plugin);
