import React, { useCallback, useEffect } from "react";
import "./index.scss";
import "./App.scss";
import "../src/renderer/styles/spacing.scss";
import "./emoji.scss";
import "renderer/services/firebase";
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
  removeCookie,
  setCookie,
} from "renderer/common/Cookie";
import { AsyncKey, LoginType } from "renderer/common/AppConfig";
import actionTypes from "renderer/actions/ActionTypes";
import api from "renderer/api";
import { acceptTeam, getInitial, logout } from "renderer/actions/UserActions";
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
import { initialSpaceToggle } from "renderer/actions/SideBarActions";
import useCurrentChannel from "renderer/hooks/useCurrentChannel";
import { sameDAppURL } from "renderer/helpers/LinkHelper";
import Web3AuthUtils from "renderer/services/connectors/Web3AuthUtils";
import { ethers } from "ethers";
import { getBlockIntoViewByElement } from "renderer/helpers/MessageHelper";
import { toast } from "react-hot-toast";

function App() {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const currentToken = useAppSelector((state) => state.configs.currentToken);
  const user = useAppSelector((state) => state.user.userData);
  const imgDomain = useAppSelector((state: any) => state.user.imgDomain);
  const currentChannel = useCurrentChannel();
  const initApp = useCallback(async () => {
    if (!imgDomain) {
      await dispatch(getInitial?.());
    }
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken && typeof accessToken === "string") {
      history.replace("/channels");
    }
  }, [imgDomain, dispatch, history]);
  const initPush = useCallback(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then((registration) => {
            //Confirm user permission for notification
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                //If notification is allowed
                navigator.serviceWorker.ready.then((p) => {
                  p.pushManager.getSubscription().then((subscription) => {
                    if (subscription === null) {
                      //If there is no notification subscription, register.
                      let re = p.pushManager.subscribe({
                        userVisibleOnly: true,
                      });
                    }
                  });
                });
              }
            });
          });
      });
    }
  }, []);
  useEffect(() => {
    dispatch(initialSpaceToggle());
  }, [dispatch]);
  useEffect(() => {
    GoogleAnalytics.init();
    getCookie(AsyncKey.accessTokenKey).then((res) => {
      dispatch({ type: actionTypes.UPDATE_CURRENT_TOKEN, payload: res });
    });
    initPush();
  }, [dispatch, initPush]);
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
    const eventClick = async (e: any) => {
      if (!e.target.download) {
        const href = e?.target?.href || e?.target?.parentElement?.href;
        if (sameDAppURL(href, currentChannel?.dapp_integration_url)) {
          e.preventDefault();
        } else if (href?.includes("channels/user")) {
          dispatch({
            type: actionTypes.UPDATE_CURRENT_USER_PROFILE_ID,
            payload: href.split("/channels/user/")[1],
          });
        } else if (href === window.location.href && href?.includes("message")) {
          const messageId = href?.split("message/")?.[1];
          if (messageId) {
            const element = document.getElementById(messageId);
            element?.scrollIntoView({
              behavior: "smooth",
              block: getBlockIntoViewByElement(element),
            });
            dispatch({
              type: actionTypes.UPDATE_HIGHLIGHT_MESSAGE,
              payload: messageId,
            });
          }
        } else if (href?.includes(window.location.origin)) {
          history.push(href.replace(window.location.origin, ""));
        } else if (href?.includes("buidler.link")) {
          e.preventDefault();
          const url = new URL(href);
          const communityUrl = url.pathname.substring(1);
          const invitationRef = url.searchParams.get("ref");
          const profileRes = await api.getProfile(communityUrl);
          const teamId = profileRes?.data?.profile?.team_id;
          const userId = profileRes?.data?.profile?.user_id;
          if (userId) {
            dispatch({
              type: actionTypes.UPDATE_CURRENT_USER_PROFILE_ID,
              payload: userId,
            });
          } else if (teamId) {
            const invitationRes = await api.invitation(teamId);
            const invitationUrl = invitationRes.data?.invitation_url;
            const invitationId = invitationUrl?.substring(
              invitationUrl?.lastIndexOf("/") + 1
            );
            if (!invitationId) {
              toast.error("Invalid invitation link");
              return;
            }
            const res: any = await dispatch(
              acceptTeam(invitationId, invitationRef)
            );
            if (res.statusCode === 200 && !!res.data?.team_id) {
              toast.success("You have successfully joined new community.");
              removeCookie(AsyncKey.lastChannelId);
              setCookie(AsyncKey.lastTeamId, teamId);
              history.push(`/channels/${teamId}`);
            }
          }
        } else if (href) {
          window.open(href, "_blank");
        }
        e.preventDefault();
      }
    };
    window.addEventListener("click", eventClick);
    return () => {
      window.removeEventListener("click", eventClick);
    };
  }, [currentChannel?.dapp_integration_url, dispatch, history]);
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
      dispatch({
        type: actionTypes.UPDATE_INTERNET_CONNECTION,
        payload: false,
      });
      SocketUtils.socket?.disconnect?.();
    };
    const eventOnline = () => {
      dispatch({ type: actionTypes.UPDATE_INTERNET_CONNECTION, payload: true });
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
    const changeRouteListener = (e) => {
      const { detail: path } = e;
      history.replace(path);
    };
    window.addEventListener("offline", eventOffline);
    window.addEventListener("online", eventOnline);
    window.addEventListener("paste", eventPaste);
    window.addEventListener("contextmenu", eventContextMenu);
    window.addEventListener(CustomEventName.CHANGE_ROUTE, changeRouteListener);
    return () => {
      window.removeEventListener("offline", eventOffline);
      window.removeEventListener("online", eventOnline);
      window.removeEventListener("paste", eventPaste);
      window.removeEventListener("contextmenu", eventContextMenu);
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
  const metamaskDisconnect = useCallback(() => {}, []);
  const metamaskUpdate = useCallback(
    (data) => {
      if (typeof data === "string") {
        dispatch({
          type: actionTypes.SWITCH_NETWORK,
          payload: parseInt(data),
        });
      } else if (data.length === 0) {
        metamaskDisconnect();
      } else if (data.length > 0) {
        dispatch({
          type: actionTypes.SET_METAMASK_ACCOUNT,
          payload: data[0],
        });
      }
    },
    [metamaskDisconnect, dispatch]
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
      .then(async (res) => {
        dispatch({ type: actionTypes.UPDATE_LOGIN_TYPE, payload: res });
        if (res === LoginType.WalletConnect) {
          WalletConnectUtils.init(connectLogout);
          if (!WalletConnectUtils.connector?.connected) {
            connectLogout();
          }
        } else if (res === LoginType.Metamask) {
          MetamaskUtils.connected = true;
          MetamaskUtils.init(
            metamaskDisconnect,
            metamaskUpdate,
            metamaskConnected
          );
        }
        // else if (res === LoginType.Web3Auth) {
        //   await Web3AuthUtils.init();
        //   if (!Web3AuthUtils.web3auth) return;
        //   const web3authProvider = await Web3AuthUtils.web3auth.connect();
        //   if (!web3authProvider) return;
        //   Web3AuthUtils.provider = new ethers.providers.Web3Provider(
        //     web3authProvider
        //   );
        // }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [
    connectLogout,
    dispatch,
    metamaskConnected,
    metamaskDisconnect,
    metamaskUpdate,
  ]);
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
