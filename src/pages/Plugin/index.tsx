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
import { getPinPosts, getStories } from "reducers/PinPostReducers";
import useShowPlugin from "hooks/useShowPlugin";
import useAppSelector from "hooks/useAppSelector";
import { getCookie } from "common/Cookie";
import { AsyncKey } from "common/AppConfig";
import { CONFIG_ACTIONS } from "reducers/ConfigReducers";

const Plugin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [pluginPosition, setPluginPosition] = useState("bottom");
  const currentToken = useAppSelector((state) => state.configs.currentToken);
  const { isShow } = useShowPlugin();
  const pluginOpen = usePluginOpen();
  const loading = useOutsideLoading();
  const channel = useChannel();
  const [style, setStyle] = useState<CSSProperties>({ height: "auto" });
  const toggle = useCallback(
    () => dispatch(OUTSIDE_ACTIONS.toggle()),
    [dispatch]
  );
  useEffect(() => {
    if (isShow) {
      window.parent.postMessage("show-plugin", "*");
    }
  }, [dispatch, isShow]);
  useEffect(() => {
    if (channel?.channel_id) {
      dispatch(getPinPosts({ channel_id: channel?.channel_id }));
    }
  }, [channel?.channel_id, dispatch]);
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
    const messageListener = async (
      e: MessageEvent<{ type: string; payload: any }>
    ) => {
      if (typeof e.data !== "object") return;
      if (!e.data.type) return;
      const { type, payload } = e.data;
      if (type === "frame-focus") {
        const token = await getCookie(AsyncKey.accessTokenKey);
        if (token !== currentToken) {
          window.location.href = `/plugin?external_url=${payload.url}`;
          dispatch(CONFIG_ACTIONS.updateCurrentToken(token));
        }
      }
      if (type === "toggle-plugin") {
        toggle();
      }
      if (type === "update-plugin-position") {
        const { lastVerticalPosition } = payload;
        setPluginPosition(lastVerticalPosition);
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
  }, [currentToken, dispatch, toggle]);
  return (
    <div
      className={`${styles.container} ${
        styles[`plugin-position-${pluginPosition}`]
      }`}
      style={style}
    >
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
