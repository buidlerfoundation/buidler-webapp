import React, { useCallback } from "react";
import toast, { Toast, useToaster } from "react-hot-toast";
import images from "../../common/images";
import "./index.scss";

type ToastItemProps = {
  t: Toast;
  offset: number;
  updateHeight: (toastId: string, height: number) => void;
};

const ToastItem = ({ t, offset, updateHeight }: ToastItemProps) => {
  const ref = useCallback(
    (el: HTMLDivElement) => {
      if (el && !t.height) {
        const { height } = el.getBoundingClientRect();
        updateHeight(t.id, height);
      }
    },
    [t.height, t.id, updateHeight]
  );
  const onDismiss = useCallback(() => {
    toast.dismiss(t.id);
  }, [t.id]);
  return (
    <div
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
      <span className="toast-notification__message">
        {t.message?.toString()}
      </span>
      <div className="btn-delete" onClick={onDismiss}>
        <img alt="" src={images.icClose} />
      </div>
    </div>
  );
};

const AppToastNotification = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause, calculateOffset, updateHeight } = handlers;
  const renderToast = useCallback(
    (t: Toast) => {
      const offset = calculateOffset(t, {
        reverseOrder: false,
        gutter: 10,
      });
      return (
        <ToastItem
          key={t.id}
          t={t}
          offset={offset}
          updateHeight={updateHeight}
        />
      );
    },
    [calculateOffset, updateHeight]
  );
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
      {toasts.map(renderToast)}
    </div>
  );
};

export default AppToastNotification;
