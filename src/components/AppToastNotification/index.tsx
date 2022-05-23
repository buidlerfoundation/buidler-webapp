import React from "react";
import images from "../../common/images";
import "./index.scss";
import toast, { useToaster } from "react-hot-toast";

const AppToastNotification = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause, calculateOffset, updateHeight } = handlers;
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 420,
        zIndex: 9999,
      }}
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {toasts.map((t: any) => {
        const offset = calculateOffset(t, {
          reverseOrder: false,
          gutter: 10,
        });
        const ref = (el: any) => {
          if (el && !t.height) {
            const { height } = el.getBoundingClientRect();
            updateHeight(t.id, height);
          }
        };
        return (
          <div
            key={t.id}
            ref={ref}
            className="toast-notification__container"
            style={{
              position: "absolute",
              transition: "all 0.5s ease-out",
              opacity: t.visible ? 1 : 0,
              transform: `translateY(${offset}px)`,
            }}
            {...t.ariaProps}
          >
            <span className={`toast-notification__title title-${t.type}`}>
              {t.className || t.type}
            </span>
            <span className="toast-notification__message">{t.message}</span>
            <div
              className="btn-delete"
              onClick={() => {
                toast.dismiss(t.id);
              }}
            >
              <img alt="" src={images.icClose} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AppToastNotification;
