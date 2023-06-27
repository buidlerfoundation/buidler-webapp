import React, {
  useState,
  useCallback,
  useEffect,
  CSSProperties,
  memo,
} from "react";
import MessageChatBox from "shared/MessageChatBox";
import CommunityFloat from "shared/CommunityFloat";
import styles from "./index.module.scss";
import useOutsideUrlType from "hooks/useOutsideUrlType";
import ChatBoxChannel from "shared/ChatBoxChannel";
import usePluginOpen from "hooks/usePluginOpen";
import useAppDispatch from "hooks/useAppDispatch";
import { OUTSIDE_ACTIONS } from "reducers/OutsideReducers";

const Plugin = () => {
  const dispatch = useAppDispatch();
  const outsideUrlType = useOutsideUrlType();
  const pluginOpen = usePluginOpen();
  const [style, setStyle] = useState<CSSProperties>({
    width: "100%",
    height: 0,
  });
  const toggle = useCallback(
    () => dispatch(OUTSIDE_ACTIONS.toggle()),
    [dispatch]
  );
  useEffect(() => {
    if (pluginOpen) {
      setStyle({
        width: "100%",
        height: "100%",
      });
      window.parent.postMessage("open-plugin", "*");
    } else {
      setTimeout(() => {
        setStyle({ width: "100%", height: 0 });
        window.parent.postMessage("close-plugin", "*");
      }, 290);
    }
  }, [pluginOpen]);
  const onBubbleClick = useCallback(() => {
    toggle();
  }, [toggle]);
  useEffect(() => {
    const messageListener = (e: any) => {
      if (e.data === "toggle-plugin") {
        toggle();
      }
    };
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [toggle]);
  const renderFloating = useCallback(() => {
    if (outsideUrlType === "main")
      return <CommunityFloat bubbleOpen={pluginOpen} shadow />;
    if (outsideUrlType === "detail")
      return <ChatBoxChannel bubbleOpen={pluginOpen} shadow />;
    return null;
  }, [pluginOpen, outsideUrlType]);
  return (
    <div className={styles["b-root-chat"]}>
      <div className={styles["b-chat__wrapper"]}>
        <div
          className={`${styles["b-chat-box__wrapper"]} ${
            pluginOpen ? styles["b-bounce-in"] : styles["b-bounce-out"]
          }`}
          style={style}
        >
          <div className={styles["b-chat-box"]}>
            <MessageChatBox />
          </div>
        </div>
        <div onClick={onBubbleClick} style={{ width: 390 }}>
          {renderFloating()}
        </div>
      </div>
    </div>
  );
};

export default memo(Plugin);
