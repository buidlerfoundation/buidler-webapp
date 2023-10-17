import React, { useEffect } from "react";
import "./index.scss";
import "./App.scss";
import "styles/spacing.scss";
import "styles/emoji.scss";
import Main from "pages/Main";
import { useNavigate } from "react-router-dom";
import { CustomEventName } from "services/events/WindowEvent";
import AppToastNotification from "shared/AppToastNotification";
import moment from "moment";

moment.locale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "seconds",
    ss: "%ss",
    m: "a minute",
    mm: "%dm",
    h: "an hour",
    hh: "%dh",
    d: "a day",
    dd: "%dd",
    M: "a month",
    MM: "%dM",
    y: "a year",
    yy: "%dY",
  },
});

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const eventOffline = () => {
      // update connection state
      // disconnect socket
    };
    const eventOnline = () => {
      // update connection state
      // checking auth
      // reconnect socket if needed
    };
    const eventPaste = (e: any) => {
      e.preventDefault();
      if (!e.clipboardData.types.includes("Files")) {
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }
    };
    const eventContextMenu = (e: any) => {
      if (!process.env.REACT_APP_ENABLE_INSPECT) e.preventDefault();
    };
    const changeRouteListener = (e: any) => {
      const {
        detail: { path, push },
      } = e;
      navigate(path, { replace: !push });
    };
    const eventKeyDown = (e: any) => {
      if (e.key === "Tab") {
        e.preventDefault();
      }
    };
    window.addEventListener("offline", eventOffline);
    window.addEventListener("online", eventOnline);
    window.addEventListener("paste", eventPaste);
    window.addEventListener("contextmenu", eventContextMenu);
    window.addEventListener("keydown", eventKeyDown);
    window.addEventListener(CustomEventName.CHANGE_ROUTE, changeRouteListener);
    return () => {
      window.removeEventListener("offline", eventOffline);
      window.removeEventListener("online", eventOnline);
      window.removeEventListener("paste", eventPaste);
      window.removeEventListener("contextmenu", eventContextMenu);
      window.removeEventListener("keydown", eventKeyDown);
      window.removeEventListener(
        CustomEventName.CHANGE_ROUTE,
        changeRouteListener
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // useEffect(() => {
  //   const eventClick = async (e: any) => {
  //     if (!e.target.download) {
  //       const href = e?.target?.href || e?.target?.parentElement?.href;
  //       if (href && !href?.includes(window.location.origin)) {
  //         window.open(href, "_blank");
  //       }
  //       e.preventDefault();
  //     }
  //   };
  //   window.addEventListener("click", eventClick);
  //   return () => {
  //     window.removeEventListener("click", eventClick);
  //   };
  // }, []);
  return (
    <>
      <Main />
      <AppToastNotification />
    </>
  );
}

export default App;
