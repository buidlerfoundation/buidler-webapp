import React, { useCallback, useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./index.module.scss";
import AppTitleBar from "./AppTitleBar";
import { DragDropContext } from "react-beautiful-dnd";
import useChannel from "hooks/useChannel";
import useCurrentCommunity from "hooks/useCurrentCommunity";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

const rootStyles: { [name: string]: React.CSSProperties } = {
  row: {
    display: "flex",
    width: "100%",
    height: "100%",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  },
};

const MainWrapper = () => {
  const location = useLocation();
  const channel = useChannel();
  const community = useCurrentCommunity();
  const hideLayoutElement = useMemo(
    () =>
      location.pathname.includes("panel") ||
      location.pathname.includes("plugin"),
    [location.pathname]
  );
  const onDragEnd = useCallback(() => {}, []);
  useEffect(() => {
    if (location && channel?.channel_url && community?.community_url) {
      const query = new URLSearchParams(location.search);
      GoogleAnalytics.tracking("Page Viewed", {
        category: "Traffic",
        page_name: "Home",
        source: query.get("ref") || "",
        path: location.pathname,
        type: location.pathname.includes("channels") ? "web-app" : "extension",
      });
    }
  }, [channel?.channel_url, community?.community_url, location]);
  if (hideLayoutElement) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }
  return (
    <div
      style={{
        ...rootStyles.col,
        overflow: "hidden",
        height: "100vh",
      }}
    >
      <div style={{ ...rootStyles.row, overflow: "hidden" }}>
        <div style={{ ...rootStyles.col, width: "100%" }}>
          <main
            id="app"
            style={{
              height: "100%",
            }}
          >
            <div className={styles.container}>
              <AppTitleBar />
              <DragDropContext onDragEnd={onDragEnd}>
                <div className={styles.body}>
                  <Outlet />
                </div>
              </DragDropContext>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainWrapper;
