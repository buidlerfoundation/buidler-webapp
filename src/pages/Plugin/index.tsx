import React, {
  useState,
  useCallback,
  useEffect,
  CSSProperties,
  memo,
  useRef,
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
import { useAuth } from "providers/AuthProvider";
import api from "api";
import { clearData } from "common/Cookie";
import { useSocket } from "providers/SocketProvider";
import { logoutAction } from "reducers/actions";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

const Plugin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const closeTimeout = useRef<any>();
  const auth = useAuth();
  const socket = useSocket();
  const [pluginPosition, setPluginPosition] = useState("bottom");
  const currentToken = useAppSelector((state) => state.configs.currentToken);
  const { isShow } = useShowPlugin();
  const pluginOpen = usePluginOpen();
  const loading = useOutsideLoading();
  const channel = useChannel();
  const extensionId = useAppSelector((state) => state.outside.extensionId);
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
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
      setStyle({
        height: "100%",
      });
      window.parent.postMessage("open-plugin", "*");
    } else {
      closeTimeout.current = setTimeout(() => {
        setStyle({ height: "auto" });
        window.parent.postMessage("close-plugin", "*");
      }, 0);
    }
  }, [pluginOpen]);
  const onLogout = useCallback(() => {
    api.logout();
    clearData(() => {
      socket.disconnect();
      setTimeout(() => {
        socket.initSocket(undefined, channel?.channel_id);
      }, 200);
    });
    dispatch(logoutAction());
    if (extensionId) {
      GoogleAnalytics.identifyByExtensionId(extensionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel?.channel_id, extensionId, dispatch]);
  useEffect(() => {
    const messageListener = async (
      e: MessageEvent<{ type: string; payload: any }>
    ) => {
      if (typeof e.data !== "object") return;
      if (!e.data.type) return;
      const { type, payload } = e.data;
      if (type === "update-authenticate") {
        const ott = payload.ott;
        if (ott) {
          auth.quickLoginWithOtt(ott);
        } else {
          onLogout();
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
  }, [currentToken, onLogout, dispatch, toggle]);
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
