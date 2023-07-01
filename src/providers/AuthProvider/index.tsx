import api from "api";
import AppConfig, { AsyncKey, LoginType, signTypeData } from "common/AppConfig";
import {
  GeneratedPrivateKey,
  clearData,
  getCookie,
  getDeviceCode,
  setCookie,
} from "common/Cookie";
import { ethers, utils } from "ethers";
import useAppDispatch from "hooks/useAppDispatch";
import useAppSelector from "hooks/useAppSelector";
import useChannels from "hooks/useChannels";
import useCommunities from "hooks/useCommunities";
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
import { logoutAction } from "reducers/UserActions";
import {
  acceptInvitation,
  getDataFromExternalUrl,
} from "reducers/UserReducers";
import { getUserCommunity, USER_ACTIONS } from "reducers/UserReducers";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import ChainId from "services/connectors/ChainId";
import MetamaskUtils from "services/connectors/MetamaskUtils";
import WalletConnectUtils from "services/connectors/WalletConnectUtils";
import Web3AuthUtils from "services/connectors/Web3AuthUtils";
import { getDeviceToken } from "services/firebase";

export interface IAuthContext {
  loginWithMetaMask: () => Promise<void>;
  loginWithWalletConnect: () => Promise<void>;
  loginWithWeb3Auth: () => Promise<void>;
  quickLogin: () => Promise<void>;
  logout: () => Promise<void>;
  loadingWeb3Auth: boolean;
}

export const AuthContext = createContext<IAuthContext>({
  loginWithMetaMask: async () => {},
  loginWithWalletConnect: async () => {},
  loginWithWeb3Auth: async () => {},
  quickLogin: async () => {},
  logout: async () => {},
  loadingWeb3Auth: false,
});

export function useAuth(): IAuthContext {
  return useContext(AuthContext);
}

interface IAuthProps {
  children?: ReactNode;
}

const AuthProvider = ({ children }: IAuthProps) => {
  const socket = useSocket();
  const query = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const communities = useCommunities();
  const channels = useChannels();
  const currentToken = useAppSelector((state) => state.configs.currentToken);
  const [loading, setLoading] = useState(true);
  const isQuickLogin = useRef(false);
  const [loadingWeb3Auth, setLoadingWeb3Auth] = useState(false);
  const ott = useMemo(() => query.get("ott"), [query]);
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
      (communities &&
        communities?.length > 0 &&
        channels.length > 0 &&
        isPublicPage)
    );
  }, [channels.length, communities, externalUrl, location.pathname]);
  const isExternalUrl = useMemo(() => {
    const path = window.location.pathname;
    return externalUrl && (path === "/panel" || path === "/plugin");
  }, [externalUrl]);
  const dispatch = useAppDispatch();
  const handleDataFromExternalUrl = useCallback(async () => {
    if (isExternalUrl) {
      const res = await dispatch(
        getDataFromExternalUrl({ url: externalUrl })
      ).unwrap();
      if (res) {
        const { community, channel } = res;
        const path = `${window.location.pathname}/${community.community_id}/${channel.channel_id}`;
        navigate(path, { replace: true });
      } else {
        // handle retry or something
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, externalUrl, isExternalUrl]);
  const getInitial = useCallback(async () => {
    const res = await api.getInitial();
    if (res.statusCode === 200) {
      dispatch(USER_ACTIONS.initial(res.data));
    }
  }, [dispatch]);
  const onSocketConnected = useCallback(async () => {}, []);
  const initialUserData = useCallback(
    async (previousLocation?: any) => {
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
            await dispatch(getUserCommunity());
            if (window.location.pathname.includes(AppConfig.loginPath)) {
              const path = previousLocation?.from?.pathname || "/";
              navigate(path, { replace: true });
            }
          }
        }
        socket.initSocket(onSocketConnected);
      } else {
        dispatch(logoutAction());
        navigate(loginPath, { replace: true });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dispatch,
      onSocketConnected,
      handleDataFromExternalUrl,
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
    async (res?: LoginApiData, loginType?: string, previousLocation?: any) => {
      if (!res) return;
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
      await initialUserData(previousLocation);
    },
    [dispatch, handleInvitation, initialUserData]
  );
  const checkingAuth = useCallback(async () => {
    setLoading(true);
    await getInitial();
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (ott) {
      const res = await api.generateTokenFromOTT(ott);
      if (res.success) {
        await handleResponseVerify(res.data, LoginType.OTT);
        setLoading(false);
        return;
      }
    }
    if (!accessToken) {
      if (canViewOnly) {
        await handleDataFromExternalUrl();
      } else if (window.location.pathname !== AppConfig.loginPath) {
        dispatch(logoutAction());
        navigate(loginPath, { replace: true, state: { from: location } });
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
    GoogleAnalytics.init();
  }, []);
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
    [getMessageSignTypedData, handleResponseVerify, location.state]
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
    metamaskConnected,
    metamaskDisconnect,
    onMetamaskUpdate,
  ]);
  const doingWCLogin = useCallback(async () => {
    if (
      !WalletConnectUtils.connector ||
      !WalletConnectUtils.connector?.connected
    )
      return;
    try {
      const { accounts } = WalletConnectUtils.connector;
      const address = accounts?.[0];
      const message = await getMessageSignTypedData(address);
      const params = [
        address,
        {
          domain: signTypeData.domain,
          types: signTypeData.types,
          message,
        },
      ];
      const signature = await WalletConnectUtils.connector.signTypedData(
        params
      );
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
          LoginType.WalletConnect,
          location.state
        );
      } else {
        WalletConnectUtils.connector.killSession();
      }
    } catch (err: any) {
      console.log(err);
      WalletConnectUtils.connector.killSession();
    }
  }, [getMessageSignTypedData, handleResponseVerify, location.state]);
  const onWCConnected = useCallback(() => {
    setTimeout(doingWCLogin, 300);
  }, [doingWCLogin]);
  const onDisconnected = useCallback(async () => {
    api.logout();
    socket.disconnect();
    clearData();
    dispatch(logoutAction());
    navigate(AppConfig.loginPath, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  const loginWithWalletConnect = useCallback(async () => {
    WalletConnectUtils.connect(onWCConnected, onDisconnected);
  }, [onDisconnected, onWCConnected]);
  const loginWithWeb3Auth = useCallback(async () => {
    setLoadingWeb3Auth(true);
    try {
      await Web3AuthUtils.init();
      if (!Web3AuthUtils.web3auth) return;
      const web3authProvider = await Web3AuthUtils.web3auth.connect();
      if (!web3authProvider) return;
      Web3AuthUtils.provider = new ethers.providers.Web3Provider(
        web3authProvider
      );
      const signer = Web3AuthUtils.provider.getSigner();
      const address = await signer.getAddress();
      const message = await getMessageSignTypedData(address);
      const params = [
        address,
        {
          domain: signTypeData.domain,
          types: signTypeData.types,
          message,
        },
      ];
      const signature = await signer.provider.send(
        "eth_signTypedData_v4",
        params
      );
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
    setLoadingWeb3Auth(false);
  }, [getMessageSignTypedData, handleResponseVerify, location.state]);
  const quickLogin = useCallback(async () => {
    isQuickLogin.current = true;
    if (window.ethereum) {
      await loginWithMetaMask();
    } else {
      await loginWithWalletConnect();
    }
    isQuickLogin.current = false;
  }, [loginWithMetaMask, loginWithWalletConnect]);
  const logout = useCallback(async () => {
    const loginType = await getCookie(AsyncKey.loginType);
    if (loginType === LoginType.WalletConnect) {
      WalletConnectUtils.disconnect();
    } else {
      if (loginType === LoginType.Web3Auth) {
        Web3AuthUtils.disconnect();
      }
      onDisconnected();
    }
  }, [onDisconnected]);
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
        loadingWeb3Auth,
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
