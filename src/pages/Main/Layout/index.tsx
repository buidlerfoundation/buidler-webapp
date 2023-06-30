import React, { useCallback, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./index.module.scss";
import AppTitleBar from "./AppTitleBar";
import { DragDropContext } from "react-beautiful-dnd";

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

  const hideLayoutElement = useMemo(
    () =>
      location.pathname.includes("panel") ||
      location.pathname.includes("plugin"),
    [location.pathname]
  );
  const onDragEnd = useCallback(() => {}, []);
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
