import { utils } from "ethers";
import React, { useCallback } from "react";
import toast from "react-hot-toast";
import NormalButton from "../NormalButton";
import "./index.scss";

const UnSupportedNetwork = () => {
  const handleChangeNetwork = useCallback(() => {
    window.ethereum
      ?.request({
        method: "wallet_switchEthereumChain",
        params: [
          { chainId: '0x1' },
        ],
      })
      .catch((err) => {
        toast.error(err.message);
      });
  }, []);
  return (
    <div className="un-supported__container">
      <span className="un-supported-text">Unsupported Network</span>
      <span className="un-supported-des-text">
        Please change your network to Ethereum Mainnet
      </span>
      <NormalButton
        title="Change network"
        onPress={handleChangeNetwork}
        type="main"
      />
    </div>
  );
};

export default UnSupportedNetwork;
