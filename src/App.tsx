import React, { useEffect } from "react";
import "./index.scss";
import "./App.scss";
import "styles/spacing.scss";
import "styles/emoji.scss";
import ErrorBoundary from "shared/ErrorBoundary";
import Main from "pages/Main";
import { useNavigate } from "react-router-dom";
import { CustomEventName } from "services/events/WindowEvent";

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
    window.addEventListener("offline", eventOffline);
    window.addEventListener("online", eventOnline);
    window.addEventListener("paste", eventPaste);
    window.addEventListener("contextmenu", eventContextMenu);
    window.addEventListener(CustomEventName.CHANGE_ROUTE, changeRouteListener);
    return () => {
      window.removeEventListener("offline", eventOffline);
      window.removeEventListener("online", eventOnline);
      window.removeEventListener("paste", eventPaste);
      window.removeEventListener("contextmenu", eventContextMenu);
      window.removeEventListener(
        CustomEventName.CHANGE_ROUTE,
        changeRouteListener
      );
    };
  }, [navigate]);
  return (
    <ErrorBoundary>
      <Main />
    </ErrorBoundary>
  );
}

export default App;
