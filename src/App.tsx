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
import {
  clearData,
  GeneratedPrivateKey,
  getCookie,
  getDeviceCode,
} from "renderer/common/Cookie";
import { AsyncKey, LoginType } from "renderer/common/AppConfig";
import actionTypes from "renderer/actions/ActionTypes";
import api from "renderer/api";
import { getInitial, logout } from "renderer/actions/UserActions";
import AppToastNotification from "renderer/shared/AppToastNotification";
import Main from "renderer/pages/Main";
import SocketUtils from "renderer/utils/SocketUtils";
import WalletConnectUtils from "renderer/services/connectors/WalletConnectUtils";
import useAppSelector from "renderer/hooks/useAppSelector";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import MetamaskUtils from "renderer/services/connectors/MetamaskUtils";
import ErrorBoundary from "renderer/shared/ErrorBoundary";
import GoogleAnalytics from "renderer/services/analytics/GoogleAnalytics";
import { CustomEventName } from "renderer/services/events/WindowEvent";
import ChainId from "renderer/services/connectors/ChainId";

function App() {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const currentToken = useAppSelector((state) => state.configs.currentToken);
  const user = useAppSelector((state) => state.user.userData);
  const imgDomain = useAppSelector((state: any) => state.user.imgDomain);
  const initApp = useCallback(async () => {
    if (!imgDomain) {
      await dispatch(getInitial?.());
    }
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken && typeof accessToken === "string") {
      history.replace("/channels");
    }
  }, [imgDomain, dispatch, history]);
  useEffect(() => {
    GoogleAnalytics.init();
    getCookie(AsyncKey.accessTokenKey).then((res) => {
      dispatch({ type: actionTypes.UPDATE_CURRENT_TOKEN, payload: res });
    });
  }, [dispatch]);
  useEffect(() => {
    if (user.user_id) {
      GoogleAnalytics.identify(user);
    }
  }, [user]);
  useEffect(() => {
    const eventFocus = async (e) => {
      const token = await getCookie(AsyncKey.accessTokenKey);
      if (token !== currentToken) {
        window.location.reload();
      }
      SocketUtils.reconnectIfNeeded();
      dispatch({ type: actionTypes.UPDATE_CURRENT_TOKEN, payload: token });
    };
    window.addEventListener("focus", eventFocus);
    return () => {
      window.removeEventListener("focus", eventFocus);
    };
  }, [currentToken, dispatch]);
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
      if (!user.user_id) {
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
    const eventContextMenu = (e: any) => {
      if (!process.env.REACT_APP_ENABLE_INSPECT) e.preventDefault();
    };
    const eventClick = (e: any) => {
      const href = e?.target?.href || e?.target?.parentElement?.href;
      if (href?.includes("channels/user")) {
        dispatch({
          type: actionTypes.UPDATE_CURRENT_USER_PROFILE_ID,
          payload: href.split("/channels/user/")[1],
        });
      } else if (href?.includes(window.location.origin)) {
        history.push(href.replace(window.location.origin, ""));
      } else if (href) {
        window.open(href, "_blank");
      }
      e.preventDefault();
    };
    const changeRouteListener = (e) => {
      const { detail: path } = e;
      history.replace(path);
    };
    window.addEventListener("offline", eventOffline);
    window.addEventListener("online", eventOnline);
    window.addEventListener("paste", eventPaste);
    window.addEventListener("contextmenu", eventContextMenu);
    window.addEventListener("click", eventClick);
    window.addEventListener(CustomEventName.CHANGE_ROUTE, changeRouteListener);
    return () => {
      window.removeEventListener("offline", eventOffline);
      window.removeEventListener("online", eventOnline);
      window.removeEventListener("paste", eventPaste);
      window.removeEventListener("contextmenu", eventContextMenu);
      window.removeEventListener("click", eventClick);
      window.removeEventListener(
        CustomEventName.CHANGE_ROUTE,
        changeRouteListener
      );
    };
  }, [user, initApp, history, dispatch]);
  const initGeneratedPrivateKey = useCallback(async () => {
    const generatedPrivateKey = await GeneratedPrivateKey();
    dispatch({
      type: actionTypes.SET_PRIVATE_KEY,
      payload: generatedPrivateKey,
    });
  }, [dispatch]);
  useEffect(() => {
    getCookie(AsyncKey.socketConnectKey).then((res) => {
      if (res) {
        initGeneratedPrivateKey();
      }
    });
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
      } else if (data.length > 0) {
        dispatch({
          type: actionTypes.SET_METAMASK_ACCOUNT,
          payload: data[0],
        });
      }
    },
    [connectLogout, dispatch]
  );
  const metamaskConnected = useCallback(() => {
    setTimeout(() => {
      const chainId =
        window.ethereum?.chainId ||
        window.ethereum?.networkVersion ||
        process.env.REACT_APP_DEFAULT_CHAIN_ID ||
        `${ChainId.EthereumMainnet}`;
      const account = window.ethereum?.selectedAddress;
      dispatch({
        type: actionTypes.SET_METAMASK_ACCOUNT,
        payload: account,
      });
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
      <ErrorBoundary>
        <Main />
        <AppToastNotification />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
