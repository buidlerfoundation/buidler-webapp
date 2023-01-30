import React, { useCallback, useEffect, useMemo } from "react";
import "./index.scss";
import { useHistory } from "react-router-dom";
import { clearData, getDeviceCode, setCookie } from "renderer/common/Cookie";
import { AsyncKey, LoginType } from "renderer/common/AppConfig";
import api from "renderer/api";
import { logout } from "renderer/actions/UserActions";
import actionTypes from "renderer/actions/ActionTypes";
import WalletConnectUtils from "renderer/services/connectors/WalletConnectUtils";
import toast from "react-hot-toast";
import images from "../../common/images";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useAppSelector from "renderer/hooks/useAppSelector";
import MetamaskUtils from "renderer/services/connectors/MetamaskUtils";
import { ethers, utils } from "ethers";
import GlobalVariable from "renderer/services/GlobalVariable";
import GoogleAnalytics from "renderer/services/analytics/GoogleAnalytics";
import ChainId from "renderer/services/connectors/ChainId";
import Web3AuthUtils from "renderer/services/connectors/Web3AuthUtils";
import IconWeb3Auth from "renderer/shared/SVG/IconWeb3Auth";

const Started = () => {
  useEffect(() => {
    GoogleAnalytics.tracking("Login Started", { category: "Login" });
  }, []);
  const dispatch = useAppDispatch();
  const hideMetaMask = useMemo(() => {
    const userAgent = window.navigator.userAgent;
    return !/Chrome/.test(userAgent);
  }, []);
  const history = useHistory();
  const dataFromUrl = useAppSelector((state) => state.configs.dataFromUrl);
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
  const handleResponseVerify = useCallback(
    async (res: any, loginType: string) => {
      GlobalVariable.loginType = loginType;
      if (
        loginType === LoginType.Metamask ||
        loginType === LoginType.WalletConnect
      ) {
        gaLoginSuccess(
          loginType === LoginType.Metamask ? "MetaMask" : "WalletConnect"
        );
      }
      dispatch({ type: actionTypes.UPDATE_CURRENT_TOKEN, payload: res?.token });
      await setCookie(AsyncKey.accessTokenKey, res?.token);
      await setCookie(AsyncKey.loginType, loginType);
      await setCookie(AsyncKey.refreshTokenKey, res?.refresh_token);
      await setCookie(AsyncKey.tokenExpire, res?.token_expire_at);
      await setCookie(
        AsyncKey.refreshTokenExpire,
        res?.refresh_token_expire_at
      );
      if (dataFromUrl?.includes?.("invitation")) {
        const invitationId = dataFromUrl.split("=")[1];
        const acceptRes = await api.acceptInvitation(invitationId);
        if (acceptRes.statusCode === 200) {
          toast.success("You have successfully joined new community.");
          dispatch({ type: actionTypes.REMOVE_DATA_FROM_URL });
          await setCookie(AsyncKey.lastTeamId, acceptRes.data?.team_id);
        }
      }
      MetamaskUtils.connected = true;
      dispatch({ type: actionTypes.UPDATE_LOGIN_TYPE, payload: loginType });
      history.replace("/channels");
    },
    [dataFromUrl, dispatch, gaLoginSuccess, history]
  );
  const doingMetamaskLogin = useCallback(
    async (address: string) => {
      try {
        const nonceRes = await api.requestNonceWithAddress(address);
        const message = nonceRes.data?.message;
        if (nonceRes.statusCode !== 200 || !message) {
          return false;
        }
        const metamaskProvider: any = window.ethereum;
        const provider = new ethers.providers.Web3Provider(metamaskProvider);
        const signer = provider.getSigner();
        const signature = await signer.signMessage(message);
        gaLoginSubmit("MetaMask");
        const res = await api.verifyNonce(message, signature);
        if (res.statusCode === 200) {
          await handleResponseVerify(res, LoginType.Metamask);
          return true;
        }
        return false;
      } catch (error: any) {
        return false;
      }
    },
    [gaLoginSubmit, handleResponseVerify]
  );
  const doingLogin = useCallback(async () => {
    if (
      !WalletConnectUtils.connector ||
      !WalletConnectUtils.connector?.connected
    )
      return;
    try {
      const { accounts } = WalletConnectUtils.connector;
      const address = accounts?.[0];
      const nonceRes = await api.requestNonceWithAddress(address);
      const message = nonceRes.data?.message;
      if (nonceRes.statusCode !== 200 || !message) {
        return;
      }
      const params = [
        utils.hexlify(ethers.utils.toUtf8Bytes(message)),
        address,
      ];
      const signature = await WalletConnectUtils.connector.signPersonalMessage(
        params
      );
      gaLoginSubmit("WalletConnect");
      const res = await api.verifyNonce(message, signature);
      if (res.statusCode === 200) {
        await handleResponseVerify(res, LoginType.WalletConnect);
      } else {
        WalletConnectUtils.connector.killSession();
      }
    } catch (err: any) {
      console.log(err);
      WalletConnectUtils.connector.killSession();
    }
  }, [gaLoginSubmit, handleResponseVerify]);
  const onWCConnected = useCallback(() => {
    setTimeout(doingLogin, 300);
  }, [doingLogin]);
  const onDisconnected = useCallback(async () => {
    if (!window.location.href.includes("started")) {
      const deviceCode = await getDeviceCode();
      await api.removeDevice({
        device_code: deviceCode,
      });
    }
    clearData(() => {
      if (!window.location.href.includes("started")) {
        window.location.reload();
      }
      dispatch(logout());
    });
  }, [dispatch]);
  const metamaskDisconnect = useCallback(() => {}, []);
  const onMetamaskUpdate = useCallback(
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
    [dispatch, metamaskDisconnect]
  );
  const metamaskConnected = useCallback(() => {
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
  }, [dispatch]);
  const handleMetamask = useCallback(() => {
    gaLoginClick("MetaMask");
    if (!window.ethereum) {
      toast.error("Please install MetaMask extension!");
    } else {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async (res) => {
          const success = await doingMetamaskLogin(res?.[0]);
          if (success) {
            MetamaskUtils.init(
              metamaskDisconnect,
              onMetamaskUpdate,
              metamaskConnected
            );
          }
        })
        .catch((err) => {
          toast.error(err.message);
        });
    }
  }, [
    doingMetamaskLogin,
    gaLoginClick,
    metamaskConnected,
    metamaskDisconnect,
    onMetamaskUpdate,
  ]);
  const handleWalletConnect = useCallback(() => {
    gaLoginClick("WalletConnect");
    WalletConnectUtils.connect(onWCConnected, onDisconnected);
  }, [gaLoginClick, onWCConnected, onDisconnected]);
  const handleSocialConnect = useCallback(async () => {
    await Web3AuthUtils.init();
    if (!Web3AuthUtils.web3auth) return;
    const web3authProvider = await Web3AuthUtils.web3auth.connect();
    if (!web3authProvider) return;
    Web3AuthUtils.provider = new ethers.providers.Web3Provider(
      web3authProvider
    );
    const signer = Web3AuthUtils.provider.getSigner();
    const address = await signer.getAddress();
    try {
      const nonceRes = await api.requestNonceWithAddress(address);
      const message = nonceRes.data?.message;
      if (nonceRes.statusCode !== 200 || !message) {
        return;
      }
      const signature = await signer.signMessage(message);
      gaLoginSubmit("Web3Auth");
      const res = await api.verifyNonce(message, signature);
      if (res.statusCode === 200) {
        await handleResponseVerify(res, LoginType.Web3Auth);
      }
    } catch (error: any) {
      console.log(error);
    }
  }, [gaLoginSubmit, handleResponseVerify]);
  return (
    <div className="started-container">
      <div className="started-body">
        <div className="started-info-view">
          <img className="started-logo" alt="" src={images.icLogoSquare} />
          <span className="started-title">
            A new home
            <br />
            for your community
            <br />
            to buidl together
          </span>
          <span className="started-description">
            Web3 application for your community, teams, and supporters to
            connect, communicate and collaborate.
          </span>
        </div>
        {!hideMetaMask && (
          <div className="wallet-button normal-button" onClick={handleMetamask}>
            <span>MetaMask</span>
            <div className="wallet-icon">
              <img src={images.icMetamask} alt="" />
            </div>
          </div>
        )}
        <div
          className="wallet-button normal-button"
          onClick={handleWalletConnect}
        >
          <span>WalletConnect</span>
          <div className="wallet-icon">
            <img src={images.icWalletConnect} alt="" />
          </div>
        </div>
        <div
          className="wallet-button normal-button"
          onClick={handleSocialConnect}
        >
          <span>SocialConnect</span>
          <div className="wallet-icon">
            <IconWeb3Auth />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Started;
