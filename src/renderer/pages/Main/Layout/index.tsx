import React from "react";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  return (
    <div style={{ ...styles.col, overflow: "hidden" }}>
      <div style={{ ...styles.row, overflow: "hidden" }}>
        <div style={{ ...styles.col, width: "100%" }}>
          <main
            id="app"
            style={{
              height:
                location.pathname === "/started"
                  ? "100vh"
                  : "calc(100vh - 50px)",
            }}
          >
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              {children}
            </MuiPickersUtilsProvider>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainWrapper;
