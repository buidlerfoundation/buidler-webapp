import React from "react";

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

const MainWrapper = (props: any) => {
  const { children } = props;
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
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainWrapper;