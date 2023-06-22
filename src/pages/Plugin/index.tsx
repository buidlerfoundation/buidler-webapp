import React, {
  useState,
  useCallback,
  useEffect,
  CSSProperties,
  memo,
} from "react";
import IconBubble from "shared/SVG/IconBubble";
import MessageChatBox from "shared/MessageChatBox";
import CommunityFloat from "shared/CommunityFloat";
import styles from "./index.module.scss";

const Plugin = () => {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({
    width: "100%",
    height: 0,
  });
  const toggle = useCallback(() => setOpen((current) => !current), []);
  useEffect(() => {
    if (open) {
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
  }, [open]);
  const onBubbleClick = useCallback(() => {
    toggle();
  }, [toggle]);
  return (
    <div className={styles["b-root-chat"]}>
      <div className={styles["b-chat__wrapper"]}>
        <div
          className={`${styles["b-chat-box__wrapper"]} ${
            open ? styles["b-bounce-in"] : styles["b-bounce-out"]
          }`}
          style={style}
        >
          <div className={styles["b-chat-box"]}>
            <MessageChatBox />
          </div>
        </div>
        <CommunityFloat bubbleOpen={open} />
      </div>
      <div
        className={`${styles["b-bubble__wrap"]} normal-button-clear`}
        onClick={onBubbleClick}
      >
        <IconBubble />
      </div>
    </div>
  );
};

export default memo(Plugin);
