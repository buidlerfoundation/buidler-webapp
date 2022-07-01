import React, { useCallback, useMemo } from "react";
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
import { ethers } from "ethers";

const Started = () => {
  const dispatch = useAppDispatch();
  const hideMetaMask = useMemo(() => {
    const userAgent = window.navigator.userAgent;
    return /Safari/.test(userAgent);
  }, []);
  const history = useHistory();
  const dataFromUrl = useAppSelector((state) => state.configs.dataFromUrl);
  const handleResponseVerify = useCallback(
    async (res: any, loginType: string) => {
      await setCookie(AsyncKey.accessTokenKey, res?.token);
      await setCookie(AsyncKey.loginType, loginType);
      if (dataFromUrl?.includes?.("invitation")) {
        const invitationId = dataFromUrl.split("=")[1];
        const acceptRes = await api.acceptInvitation(invitationId);
        if (acceptRes.statusCode === 200) {
          toast.success("You have successfully joined new team.");
          dispatch({ type: actionTypes.REMOVE_DATA_FROM_URL });
          await setCookie(AsyncKey.lastTeamId, acceptRes.data?.team_id);
        }
      }
      MetamaskUtils.connected = true;
      history.replace("/channels");
    },
    [dataFromUrl, dispatch, history]
  );
  const doingMetamaskLogin = useCallback(
    async (address: string) => {
      const nonceRes = await api.requestNonceWithAddress(address);
      const message = nonceRes.data?.message;
      if (nonceRes.statusCode !== 200 || !message) {
        toast.error(nonceRes?.message || "");
        return;
      }
      const metamaskProvider: any = window.ethereum;
      const provider = new ethers.providers.Web3Provider(metamaskProvider);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      const res = await api.verifyNonce(message, signature);
      if (res.statusCode === 200) {
        await handleResponseVerify(res, LoginType.Metamask);
      } else {
        toast.error(res.message || "");
      }
    },
    [handleResponseVerify]
  );
  const doingLogin = useCallback(async () => {
    if (
      !WalletConnectUtils.connector ||
      !WalletConnectUtils.connector?.connected
    )
      return;
    try {
      const { accounts, peerMeta } = WalletConnectUtils.connector;
      const address = accounts?.[0];
      const nonceRes = await api.requestNonceWithAddress(address);
      const message = nonceRes.data?.message;
      if (nonceRes.statusCode !== 200 || !message) {
        toast.error(nonceRes?.message || "");
        return;
      }
      if (peerMeta.name === "MetaMask") {
        toast.error("Something wrongs, you can try another wallet");
        WalletConnectUtils.connector.killSession();
        return;
      }
      const params = [address, message];
      const signature = await WalletConnectUtils.connector.signMessage(params);
      const res = await api.verifyNonce(message, signature);
      if (res.statusCode === 200) {
        await handleResponseVerify(res, LoginType.WalletConnect);
      } else {
        toast.error(res.message || "");
        WalletConnectUtils.connector.killSession();
      }
    } catch (err) {
      console.log(err);
      WalletConnectUtils.connector.killSession();
    }
  }, [handleResponseVerify]);
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
  const onMetamaskUpdate = useCallback(
    (data) => {
      if (typeof data === "string") {
        dispatch({
          type: actionTypes.SWITCH_NETWORK,
          payload: parseInt(data),
        });
      } else if (data.length === 0) {
        onDisconnected();
      }
    },
    [dispatch, onDisconnected]
  );
  const metamaskConnected = useCallback(() => {
    const chainId = window.ethereum?.chainId || "";
    dispatch({
      type: actionTypes.SWITCH_NETWORK,
      payload: parseInt(chainId),
    });
  }, [dispatch]);
  const handleMetamask = useCallback(() => {
    if (!window.ethereum) {
      toast.error("install metamask extension!");
    } else {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => {
          doingMetamaskLogin(res?.[0]);
          MetamaskUtils.init(
            onDisconnected,
            onMetamaskUpdate,
            metamaskConnected
          );
        })
        .catch((err) => {
          toast.error(err.message);
        });
    }
  }, [doingMetamaskLogin, metamaskConnected, onDisconnected, onMetamaskUpdate]);
  const handleWalletConnect = useCallback(() => {
    WalletConnectUtils.connect(onWCConnected, onDisconnected);
  }, [onWCConnected, onDisconnected]);
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
      </div>
    </div>
  );
};

export default Started;
