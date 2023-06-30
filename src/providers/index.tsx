import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React, { useMemo } from "react";
import { Provider } from "react-redux";
import store from "store";
import SocketProvider from "./SocketProvider";
import AuthProvider from "./AuthProvider";
import ImageProvider from "./ImageProvider";

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
      <ThemeProvider theme={materialTheme}>
        <SocketProvider>
          <AuthProvider>
            <ImageProvider>{children}</ImageProvider>
          </AuthProvider>
        </SocketProvider>
        <CssBaseline />
      </ThemeProvider>
    </Provider>
  );
};

export default Providers;
