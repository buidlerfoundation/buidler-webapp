import React, { useCallback, useEffect } from "react";
import "./index.scss";
import "./App.scss";
import "../src/renderer/styles/spacing.scss";
import "./emoji.scss";
import { useHistory } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { ThemeProvider } from "@material-ui/styles";
import { createTheme } from "@material-ui/core";
import GlobalVariable from "renderer/services/GlobalVariable";
import { clearData, getCookie, getDeviceCode } from "renderer/common/Cookie";
import { AsyncKey, LoginType } from "renderer/common/AppConfig";
import actionTypes from "renderer/actions/ActionTypes";
import api from "renderer/api";
import { findUser, getInitial, logout } from "renderer/actions/UserActions";
import AppToastNotification from "renderer/shared/AppToastNotification";
import Main from "renderer/pages/Main";
import SocketUtils from "renderer/utils/SocketUtils";
import WalletConnectUtils from "renderer/services/connectors/WalletConnectUtils";
import useAppSelector from "renderer/hooks/useAppSelector";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import MetamaskUtils from "renderer/services/connectors/MetamaskUtils";

function App() {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userData);
  const imgDomain = useAppSelector((state: any) => state.user.imgDomain);
  const initApp = useCallback(async () => {
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken && typeof accessToken === "string") {
      await dispatch(findUser?.());
      history.replace("/channels");
    }
    if (!imgDomain) {
      await dispatch(getInitial?.());
    }
  }, [imgDomain, dispatch, history]);
  useEffect(() => {
    TextareaAutosize.defaultProps = {
      ...TextareaAutosize.defaultProps,
      onFocus: () => {
        GlobalVariable.isInputFocus = true;
      },
      onBlur: () => {
        GlobalVariable.isInputFocus = false;
      },
    };
    const eventOffline = () => {
      SocketUtils.socket?.disconnect?.();
    };
    const eventOnline = () => {
      if (!user) {
        initApp();
      } else {
        SocketUtils.reconnectIfNeeded();
      }
    };
    const eventPaste = (e: any) => {
      e.preventDefault();
      if (!e.clipboardData.types.includes("Files")) {
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }
    };
    window.addEventListener("offline", eventOffline);
    window.addEventListener("online", eventOnline);
    window.addEventListener("paste", eventPaste);
    return () => {
      window.removeEventListener("offline", eventOffline);
      window.removeEventListener("online", eventOnline);
      window.removeEventListener("paste", eventPaste);
    };
  }, [user, initApp]);
  const initGeneratedPrivateKey = useCallback(async () => {
    const generatedPrivateKey = await getCookie(AsyncKey.generatedPrivateKey);
    if (typeof generatedPrivateKey === "string") {
      dispatch({
        type: actionTypes.SET_PRIVATE_KEY,
        payload: generatedPrivateKey,
      });
    }
  }, [dispatch]);
  useEffect(() => {
    initGeneratedPrivateKey();
  }, [initGeneratedPrivateKey]);
  const connectLogout = useCallback(async () => {
    const deviceCode = await getDeviceCode();
    await api.removeDevice({
      device_code: deviceCode,
    });
    clearData(() => {
      window.location.reload();
      dispatch(logout?.());
    });
  }, [dispatch]);
  const metamaskUpdate = useCallback(
    (data) => {
      if (typeof data === "string") {
        dispatch({
          type: actionTypes.SWITCH_NETWORK,
          payload: parseInt(data),
        });
      } else if (data.length === 0) {
        connectLogout();
      }
    },
    [connectLogout, dispatch]
  );
  const metamaskConnected = useCallback(() => {
    setTimeout(() => {
      const chainId = window.ethereum?.chainId || "";
      dispatch({
        type: actionTypes.SWITCH_NETWORK,
        payload: parseInt(chainId),
      });
    }, 300);
  }, [dispatch]);
  useEffect(() => {
    getCookie(AsyncKey.loginType)
      .then((res) => {
        if (res === LoginType.WalletConnect) {
          WalletConnectUtils.init(connectLogout);
          if (!WalletConnectUtils.connector?.connected) {
            connectLogout();
          }
        } else if (res === LoginType.Metamask) {
          MetamaskUtils.connected = true;
          MetamaskUtils.init(connectLogout, metamaskUpdate, metamaskConnected);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [connectLogout, dispatch, metamaskConnected, metamaskUpdate]);
  const overrides: any = {
    MuiPickersDay: {
      day: {
        color: "var(--color-primary-text)",
      },
      daySelected: {
        backgroundColor: "var(--color-stroke)",
      },
      dayDisabled: {
        color: "var(--color-secondary-text)",
      },
      current: {
        color: "var(--color-success)",
      },
    },
  };
  const materialTheme = createTheme({
    overrides,
    typography: {
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`,
      fontWeightMedium: 600,
      fontWeightBold: "bold",
    },
  });

  return (
    <ThemeProvider theme={materialTheme}>
      <div>
        <Main />
        <AppToastNotification />
      </div>
    </ThemeProvider>
  );
}

export default App;
