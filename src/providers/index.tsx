"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React, { useMemo } from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import MagicProvider from "./MagicProvider";

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers = ({ children }: ProvidersProps) => {
  const materialTheme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: `SF-UI-Text, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`,
          fontWeightRegular: 500,
          fontWeightMedium: 600,
          fontWeightBold: "bold",
        },
        palette: {
          background: {
            default: "transparent",
          },
        },
      }),
    []
  );
  return (
    <Provider store={store}>
      <MagicProvider>
        <ThemeProvider theme={materialTheme}>
          {children}
          <CssBaseline />
        </ThemeProvider>
      </MagicProvider>
    </Provider>
  );
};

export default Providers;
