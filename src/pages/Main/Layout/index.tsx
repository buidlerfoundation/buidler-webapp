import React from "react";
import { Outlet } from "react-router-dom";

const styles: { [name: string]: React.CSSProperties } = {
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
  return (
    <div
      style={{
        ...styles.col,
        overflow: "hidden",
        height: "100vh",
      }}
    >
      <div style={{ ...styles.row, overflow: "hidden" }}>
        <div style={{ ...styles.col, width: "100%" }}>
          <main
            id="app"
            style={{
              height: "100%",
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainWrapper;
