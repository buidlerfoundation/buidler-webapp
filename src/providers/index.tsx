"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React, { useMemo, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "store";

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers = ({ children }: ProvidersProps) => {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }
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
    <Provider store={storeRef.current}>
      <ThemeProvider theme={materialTheme}>
        {children}
        {/* <SocketProvider>
          <WalletConnectProvider>
            <AuthProvider>
              <ImageProvider>{children}</ImageProvider>
            </AuthProvider>
          </WalletConnectProvider>
        </SocketProvider> */}
        <CssBaseline />
      </ThemeProvider>
    </Provider>
  );
};

export default Providers;
