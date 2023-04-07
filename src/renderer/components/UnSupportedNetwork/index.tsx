import React, { useCallback } from "react";
import toast from "react-hot-toast";
import { AsyncKey } from "renderer/common/AppConfig";
import { removeCookie } from "renderer/common/Cookie";
import NormalButton from "renderer/shared/NormalButton";
import "./index.scss";

const UnSupportedNetwork = () => {
  const handleChangeNetwork = useCallback(() => {
    window.ethereum
      ?.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: `0x${parseInt(
              process.env.REACT_APP_DEFAULT_CHAIN_ID || '0'
            ).toString(16)}`,
          },
        ],
      })
      .then(() => {
        removeCookie(AsyncKey.socketConnectKey);
        window.location.reload();
      })
      .catch((err) => {
        toast.error(err.message);
      });
  }, []);
  return (
    <div className="un-supported__container">
      <div className="top-view" />
      <div className="page-body">
        <div className="side-bar-view" />
        <div className="un-support-view">
          <span className="un-supported-text">
            Unsupported Network <br />
            Please change your network to Ethereum Mainnet
          </span>
          <NormalButton
            title="Change network"
            onPress={handleChangeNetwork}
            type="main"
          />
        </div>
      </div>
    </div>
  );
};

export default UnSupportedNetwork;
