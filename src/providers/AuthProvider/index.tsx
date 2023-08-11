import api from "api";
import AppConfig, {
  AsyncKey,
  LoginType,
  pageNames,
  signTypeData,
  websitePath,
} from "common/AppConfig";
import {
  GeneratedPrivateKey,
  clearData,
  getCookie,
  getDeviceCode,
  setCookie,
} from "common/Cookie";
import { ethers, utils } from "ethers";
import useAppDispatch from "hooks/useAppDispatch";
import useChannels from "hooks/useChannels";
import usePinnedCommunities from "hooks/usePinnedCommunities";
import useQuery from "hooks/useQuery";
import { LoginApiData } from "models/User";
import { useSocket } from "providers/SocketProvider";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { CONFIG_ACTIONS } from "reducers/ConfigReducers";
import { NETWORK_ACTIONS } from "reducers/NetworkReducers";
import { logoutAction } from "reducers/actions";
import {
  acceptInvitation,
  getDataFromExternalUrl,
  getPinnedCommunities,
  setUserCommunityData,
} from "reducers/UserActions";
import { USER_ACTIONS } from "reducers/UserReducers";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import ChainId from "services/connectors/ChainId";
import MetamaskUtils from "services/connectors/MetamaskUtils";
import Web3AuthUtils from "services/connectors/Web3AuthUtils";
import { getDeviceToken } from "services/firebase";
import { useWalletConnectClient } from "providers/WalletConnectProvider";
import useUser from "hooks/useUser";
import { OUTSIDE_ACTIONS } from "reducers/OutsideReducers";
import { getParamsFromPath, getShareIdFromPath } from "helpers/LinkHelper";

export interface IAuthContext {
  loginWithMetaMask: () => Promise<void>;
  loginWithWalletConnect: () => Promise<void>;
  loginWithWeb3Auth: () => Promise<void>;
  quickLogin: () => Promise<void>;
  logout: () => Promise<void>;
  loadingWeb3Auth: boolean;
  openLogin: boolean;
  toggleLogin: () => void;
  onCloseLogin: () => void;
}

export const AuthContext = createContext<IAuthContext>({
  loginWithMetaMask: async () => {},
  loginWithWalletConnect: async () => {},
  loginWithWeb3Auth: async () => {},
  quickLogin: async () => {},
  logout: async () => {},
  loadingWeb3Auth: false,
  openLogin: false,
  toggleLogin: () => {},
  onCloseLogin: () => {},
});

export function useAuth(): IAuthContext {
  return useContext(AuthContext);
}

interface IAuthProps {
  children?: ReactNode;
}

const AuthProvider = ({ children }: IAuthProps) => {
  const { connect, disconnect, accounts, web3Provider } =
    useWalletConnectClient();
  const socket = useSocket();
  const query = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const pinnedCommunities = usePinnedCommunities();
  const channels = useChannels();
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const isQuickLogin = useRef(false);
  const [loadingWeb3Auth, setLoadingWeb3Auth] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const ott = useMemo(() => query.get("ott"), [query]);
  const autoOff = useMemo(() => query.get("auto_off"), [query]);
  const openAtFirst = useMemo(() => query.get("open_at_first"), [query]);
  const externalUrl = useMemo(
    () => window.location.href.split("external_url=")?.[1]?.split("&ott")?.[0],
    []
  );
  const invitationId = useMemo(() => query.get("invitation"), [query]);
  const invitationRef = useMemo(() => query.get("ref"), [query]);
  const loginPath = useMemo(() => {
    let path = AppConfig.loginPath;
    if (invitationId) {
      path += `?invitation=${invitationId}`;
      if (invitationRef) {
        path += `&ref=${invitationRef}`;
      }
    }
    return path;
  }, [invitationId, invitationRef]);
  const canViewOnly = useMemo(() => {
    const path = location.pathname;
    const isPublicPage = path.includes("panel") || path.includes("plugin");
    return (
      (externalUrl && isPublicPage) ||
      (pinnedCommunities &&
        pinnedCommunities?.length > 0 &&
        channels?.length > 0 &&
        isPublicPage)
    );
  }, [channels?.length, pinnedCommunities, externalUrl, location.pathname]);
  const isExternalUrl = useMemo(() => {
    const path = window.location.pathname;
    return externalUrl && (path === "/panel" || path === "/plugin");
  }, [externalUrl]);
  const gaLoginSuccess = useCallback((label: string) => {
    GoogleAnalytics.tracking("Login Successful", {
      category: "Login",
      method: label,
    });
  }, []);
  const gaLoginSubmit = useCallback((label: string) => {
    GoogleAnalytics.tracking("Login Submitted", {
      category: "Login",
      method: label,
    });
  }, []);
  const gaLoginClick = useCallback((label: string) => {
    GoogleAnalytics.tracking("Login Method Selected", {
      category: "Login",
      method: label,
    });
  }, []);
  const dispatch = useAppDispatch();
  const toggleLogin = useCallback(
    () => setOpenLogin((current) => !current),
    []
  );
  const onCloseLogin = useCallback(() => {
    setOpenLogin(false);
    isQuickLogin.current = false;
  }, []);
  const handleDataFromExternalUrl = useCallback(
    async (connectSocket?: boolean) => {
      if (isExternalUrl) {
        const res = await dispatch(
          getDataFromExternalUrl({ url: externalUrl })
        ).unwrap();
        if (res) {
          const { community, channel } = res;
          const path = `${window.location.pathname}/${community.community_id}/${channel.channel_id}`;
          if (connectSocket && channel.channel_id) {
            socket.initSocket(onSocketConnected, channel.channel_id);
          }
          navigate(path, { replace: true });
        } else {
          // handle retry or something
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, externalUrl, isExternalUrl]
  );
  const getInitial = useCallback(async () => {
    const res = await api.getInitial();
    if (res.statusCode === 200) {
      dispatch(USER_ACTIONS.initial(res.data));
    }
  }, [dispatch]);
  const onSocketConnected = useCallback(async () => {}, []);
  const initialUserData = useCallback(
    async (previousState?: any) => {
      const userRes = await api.findUser();
      if (userRes.statusCode === 200) {
        dispatch(
          USER_ACTIONS.updateCurrentUser({
            user: userRes.data,
          })
        );
        if (!isQuickLogin.current) {
          if (isExternalUrl) {
            await handleDataFromExternalUrl();
          } else {
            const actionRes = await dispatch(
              getPinnedCommunities({
                externalUrl: externalUrl || previousState?.externalUrl,
              })
            ).unwrap();
            if (actionRes?.externalUrlRes?.data) {
              const { community, channel } = actionRes?.externalUrlRes?.data;
              if (community && channel) {
                await dispatch(setUserCommunityData(community.community_id));
                navigate(
                  `/channels/${community.community_id}/${channel.channel_id}`,
                  { replace: true }
                );
              }
            } else if (window.location.pathname.includes(AppConfig.loginPath)) {
              const path = previousState?.from?.pathname || "/";
              navigate(path, { replace: true });
            }
          }
        } else {
          onCloseLogin();
        }
        const matchParams = getParamsFromPath();
        const { page_name, match_channel_id } = matchParams || {};
        socket.disconnect();
        if (page_name === "plugin" && match_channel_id) {
          socket.initSocket(onSocketConnected, match_channel_id);
        } else {
          socket.initSocket(onSocketConnected);
        }
      } else {
        clearData(async () => {
          dispatch(logoutAction());
          if (canViewOnly) {
            await handleDataFromExternalUrl();
          } else {
            navigate(loginPath, { replace: true, state: { externalUrl } });
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dispatch,
      onSocketConnected,
      handleDataFromExternalUrl,
      onCloseLogin,
      isExternalUrl,
      loginPath,
    ]
  );
  const handleInvitation = useCallback(async () => {
    if (invitationId) {
      const acceptInvitationActionRes = await dispatch(
        acceptInvitation({ invitationId, ref: invitationRef })
      ).unwrap();
      if (
        acceptInvitationActionRes.statusCode === 200 &&
        !!acceptInvitationActionRes.data?.community_id
      ) {
        if (acceptInvitationActionRes.metadata?.is_new_team_member) {
          toast.success("You have successfully joined new community.");
        }
        setCookie(
          AsyncKey.lastTeamId,
          acceptInvitationActionRes.data?.community_id
        );
      }
    }
  }, [dispatch, invitationId, invitationRef]);
  const handleResponseVerify = useCallback(
    async (res?: LoginApiData, loginType?: string, previousState?: any) => {
      if (!res) return;
      if (loginType && loginType !== LoginType.OTT) {
        gaLoginSuccess(
          loginType === LoginType.Metamask ? "MetaMask" : loginType
        );
      }
      await setCookie(AsyncKey.accessTokenKey, res?.token);
      await setCookie(AsyncKey.loginType, loginType);
      await setCookie(AsyncKey.refreshTokenKey, res?.refresh_token);
      await setCookie(AsyncKey.tokenExpire, res?.token_expire_at);
      await setCookie(
        AsyncKey.refreshTokenExpire,
        res?.refresh_token_expire_at
      );
      dispatch(CONFIG_ACTIONS.updateCurrentToken(res?.token));
      dispatch(CONFIG_ACTIONS.updateLoginType(loginType));
      await handleInvitation();
      await initialUserData(previousState);
    },
    [dispatch, gaLoginSuccess, handleInvitation, initialUserData]
  );
  const checkingAuth = useCallback(async () => {
    if (websitePath.includes(location.pathname)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    await getInitial();
    const matchParams = getParamsFromPath();
    const { page_name, match_channel_id, match_community_id } =
      matchParams || {};
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (ott) {
      const res = await api.generateTokenFromOTT(ott);
      if (res.success) {
        await handleResponseVerify(res.data, LoginType.OTT);
        if (page_name === "plugin") {
          socket.initSocket(onSocketConnected, match_channel_id);
        }
        setLoading(false);
        return;
      }
    }
    if (!accessToken) {
      if (canViewOnly) {
        await handleDataFromExternalUrl(true);
      } else if (window.location.pathname !== AppConfig.loginPath) {
        const shareId = getShareIdFromPath();
        if (shareId && !pageNames.includes(shareId)) {
          const shareInformation = await api.getCommunityDataFromShareId(
            shareId
          );
          if (shareInformation.success) {
            navigate(
              `/channels/${shareInformation.data?.community?.community_id}/${shareInformation.data?.channel?.channel_id}`
            );
          }
          setLoading(false);
          return;
        }
        if (!match_channel_id || !match_community_id) {
          dispatch(logoutAction());
          navigate(loginPath, { replace: true, state: { from: location } });
        } else {
          socket.initSocket(onSocketConnected, match_channel_id);
        }
      }
    } else {
      dispatch(CONFIG_ACTIONS.updateCurrentToken(accessToken));
      await handleInvitation();
      await initialUserData();
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (autoOff) {
      dispatch(OUTSIDE_ACTIONS.updateAutoOff(autoOff === "true"));
    }
  }, [autoOff, dispatch]);
  useEffect(() => {
    if (openAtFirst) {
      dispatch(OUTSIDE_ACTIONS.openAtFirst());
    }
  }, [dispatch, openAtFirst]);
  useEffect(() => {
    GoogleAnalytics.init();
  }, []);
  useEffect(() => {
    if (user.user_id) {
      GoogleAnalytics.identify(user);
    }
  }, [user]);
  useEffect(() => {
    checkingAuth();
  }, [checkingAuth]);

  // Temporary comment out event check difference token
  // useEffect(() => {
  //   const eventFocus = async (e: FocusEvent) => {
  //     const token = await getCookie(AsyncKey.accessTokenKey);
  //     if (token !== currentToken) {
  //       window.location.reload();
  //     }
  //     dispatch(CONFIG_ACTIONS.updateCurrentToken(token));
  //   };
  //   window.addEventListener("focus", eventFocus);
  //   return () => {
  //     window.removeEventListener("focus", eventFocus);
  //   };
  // }, [currentToken, dispatch]);

  const getMessageSignTypedData = useCallback(async (address: string) => {
    const deviceCode = await getDeviceCode();
    const deviceToken = await getDeviceToken();
    const generatedPrivateKey = await GeneratedPrivateKey();
    const publicKey = utils.computePublicKey(generatedPrivateKey, true);
    return {
      device: {
        platform: "web",
        user_agent: navigator.userAgent,
        device_name: "",
        device_code: deviceCode,
        device_token: deviceToken || "",
        encrypt_message_key: publicKey,
      },
      address,
    };
  }, []);

  const doingMetamaskLogin = useCallback(
    async (address: string) => {
      try {
        const metamaskProvider: any = window.ethereum;
        const provider = new ethers.providers.Web3Provider(metamaskProvider);
        const signer = provider.getSigner();
        const message = await getMessageSignTypedData(address);
        const signature = await signer._signTypedData(
          signTypeData.domain,
          signTypeData.types,
          message
        );
        gaLoginSubmit("MetaMask");
        const res = await api.verifyNonce(
          {
            domain: signTypeData.domain,
            types: signTypeData.types,
            value: message,
          },
          signature
        );
        if (res.statusCode === 200) {
          await handleResponseVerify(
            res.data,
            LoginType.Metamask,
            location.state
          );
          return true;
        }
        return false;
      } catch (error: any) {
        return false;
      }
    },
    [
      gaLoginSubmit,
      getMessageSignTypedData,
      handleResponseVerify,
      location.state,
    ]
  );
  const metamaskDisconnect = useCallback(() => {}, []);
  const onMetamaskUpdate = useCallback(
    (data: any) => {
      if (typeof data === "string") {
        dispatch(NETWORK_ACTIONS.switchNetwork(parseInt(data)));
      } else if (data.length === 0) {
        metamaskDisconnect();
      } else if (data.length > 0) {
        dispatch(NETWORK_ACTIONS.setMetaMaskAccount(data[0]));
      }
    },
    [dispatch, metamaskDisconnect]
  );
  const metamaskConnected = useCallback(() => {
    const chainId =
      window.ethereum?.chainId ||
      window.ethereum?.networkVersion ||
      process.env.NEXT_PUBLIC_CHAIN_ID ||
      `${ChainId.EthereumMainnet}`;
    const account = window.ethereum?.selectedAddress || "";
    dispatch(NETWORK_ACTIONS.setMetaMaskAccount(account));
    dispatch(NETWORK_ACTIONS.switchNetwork(chainId));
  }, [dispatch]);

  const loginWithMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask extension!");
    } else {
      gaLoginClick("MetaMask");
      try {
        const res: any = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const success = await doingMetamaskLogin(res?.[0]);
        if (success) {
          MetamaskUtils.init(
            metamaskDisconnect,
            onMetamaskUpdate,
            metamaskConnected
          );
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  }, [
    doingMetamaskLogin,
    gaLoginClick,
    metamaskConnected,
    metamaskDisconnect,
    onMetamaskUpdate,
  ]);
  const doingWCLogin = useCallback(async () => {
    const address = accounts?.[0];
    if (!address) return;
    try {
      const message = await getMessageSignTypedData(address);
      const signer = web3Provider?.getSigner();
      const signature = await signer?._signTypedData(
        signTypeData.domain,
        signTypeData.types,
        message
      );
      gaLoginSubmit("WalletConnect");
      const res = await api.verifyNonce(
        {
          domain: signTypeData.domain,
          types: signTypeData.types,
          value: message,
        },
        signature || ""
      );
      if (res.statusCode === 200) {
        await handleResponseVerify(
          res.data,
          LoginType.WalletConnect,
          location.state
        );
      } else {
        disconnect();
      }
    } catch (err: any) {
      console.log(err);
      disconnect();
    }
  }, [
    accounts,
    disconnect,
    gaLoginSubmit,
    getMessageSignTypedData,
    handleResponseVerify,
    location.state,
    web3Provider,
  ]);
  const onDisconnected = useCallback(async () => {
    api.logout();
    socket.disconnect();
    clearData();
    dispatch(logoutAction());
    navigate(AppConfig.loginPath, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  const loginWithWalletConnect = useCallback(async () => {
    gaLoginClick("WalletConnect");
    connect();
  }, [connect, gaLoginClick]);
  useEffect(() => {
    if (accounts?.length > 0 && !loading && !user.user_id) {
      doingWCLogin();
    }
  }, [accounts, doingWCLogin, loading, user.user_id]);
  const loginWithWeb3Auth = useCallback(async () => {
    gaLoginClick("Web3Auth");
    setLoadingWeb3Auth(true);
    try {
      await Web3AuthUtils.init();
      setLoadingWeb3Auth(false);
      if (!Web3AuthUtils.web3auth) return;
      const web3authProvider = await Web3AuthUtils.web3auth.connect();
      if (!web3authProvider) return;
      Web3AuthUtils.provider = new ethers.providers.Web3Provider(
        web3authProvider
      );
      const signer = Web3AuthUtils.provider.getSigner();
      const address = await signer.getAddress();
      const message = await getMessageSignTypedData(address);
      const signature = await signer._signTypedData(
        signTypeData.domain,
        signTypeData.types,
        message
      );
      gaLoginSubmit("Web3Auth");
      const res = await api.verifyNonce(
        {
          domain: signTypeData.domain,
          types: signTypeData.types,
          value: message,
        },
        signature
      );
      if (res.statusCode === 200) {
        await handleResponseVerify(
          res.data,
          LoginType.Web3Auth,
          location.state
        );
      }
    } catch (error: any) {
      console.log(error);
    }
  }, [
    gaLoginClick,
    gaLoginSubmit,
    getMessageSignTypedData,
    handleResponseVerify,
    location.state,
  ]);
  const quickLogin = useCallback(async () => {
    isQuickLogin.current = true;
    toggleLogin();
  }, [toggleLogin]);
  const logout = useCallback(async () => {
    const loginType = await getCookie(AsyncKey.loginType);
    if (loginType === LoginType.WalletConnect) {
      disconnect();
    } else {
      if (loginType === LoginType.Web3Auth) {
        Web3AuthUtils.disconnect();
      }
    }
    onDisconnected();
  }, [disconnect, onDisconnected]);
  // useEffect(() => {
  //   getCookie(AsyncKey.loginType)
  //     .then(async (res) => {
  //       dispatch(CONFIG_ACTIONS.updateLoginType(res));
  //       if (res === LoginType.WalletConnect) {
  //         WalletConnectUtils.init(onDisconnected);
  //         if (!WalletConnectUtils.connector?.connected) {
  //           onDisconnected();
  //         }
  //       } else if (res === LoginType.Metamask) {
  //         MetamaskUtils.connected = true;
  //         MetamaskUtils.init(
  //           metamaskDisconnect,
  //           onMetamaskUpdate,
  //           metamaskConnected
  //         );
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, [
  //   onDisconnected,
  //   dispatch,
  //   metamaskConnected,
  //   metamaskDisconnect,
  //   onMetamaskUpdate,
  // ]);
  return (
    <AuthContext.Provider
      value={{
        loginWithMetaMask,
        loginWithWalletConnect,
        loginWithWeb3Auth,
        quickLogin,
        logout,
        toggleLogin,
        onCloseLogin,
        loadingWeb3Auth,
        openLogin,
      }}
    >
      {loading && (
        <div
          style={{
            height: "100vh",
          }}
        />
      )}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
