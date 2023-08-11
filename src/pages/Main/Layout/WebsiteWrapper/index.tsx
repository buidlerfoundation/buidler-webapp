import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import styles from "./index.module.scss";

const WebsiteWrapper = () => {
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    GoogleAnalytics.init();
  }, []);
  useEffect(() => {
    setLoaded(false);
    const query = new URLSearchParams(location.search);
    GoogleAnalytics.tracking("Page Viewed", {
      category: "Traffic",
      page_name: "Home",
      source: query.get("ref") || "",
      path: location.pathname,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  const onFrameLoaded = useCallback(() => {
    setLoaded(true);
  }, []);
  const getBubbleHeight = useCallback(() => {
    const isMainUrl = location.pathname === "/";
    return isMainUrl ? "130px" : "165px";
  }, [location.pathname]);
  useEffect(() => {
    const messageListener = (e: any) => {
      const plugin = document.getElementById("buidler-plugin");
      if (plugin) {
        if (e.data === "show-plugin") {
          plugin.style.display = "block";
        }
        if (e.data === "hide-plugin") {
          plugin.style.display = "none";
        }
        if (e.data === "open-plugin") {
          plugin.style.height = "100vh";
        }
        if (e.data === "close-plugin") {
          plugin.style.height = getBubbleHeight();
        }
        if (e.data === "open-plugin-menu") {
          plugin.style.height = "650px";
        }
        if (e.data === "close-plugin-menu") {
          plugin.style.height = getBubbleHeight();
        }
      }
    };
    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [getBubbleHeight]);
  return (
    <>
      <Outlet />
      {!window.self.frameElement && (
        <div
          id="buidler-plugin"
          className={styles["iframe__wrapper"]}
          style={{ opacity: loaded ? 1 : 0, height: getBubbleHeight() }}
        >
          <iframe
            title="buidler-plugin"
            id="buidler-plugin-frame"
            src={`/plugin?external_url=${window.location.origin}${location.pathname}`}
            className={styles["iframe-buidler"]}
            onLoad={onFrameLoaded}
          />
        </div>
      )}
    </>
  );
};

export default memo(WebsiteWrapper);
