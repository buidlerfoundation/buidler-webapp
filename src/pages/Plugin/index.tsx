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

const Plugin = () => {
  const dispatch = useAppDispatch();
  const pluginOpen = usePluginOpen();
  const [style, setStyle] = useState<CSSProperties>({ height: "auto" });
  const toggle = useCallback(
    () => dispatch(OUTSIDE_ACTIONS.toggle()),
    [dispatch]
  );
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
  return (
    <div className={styles.container} style={style}>
      <div
        className={`${styles["b-root-chat"]} ${
          pluginOpen ? styles["b-root-chat-on"] : styles["b-root-chat-off"]
        }`}
      >
        <MessageChatBox toggleOutside={toggle} />
      </div>
    </div>
  );
};

export default memo(Plugin);
