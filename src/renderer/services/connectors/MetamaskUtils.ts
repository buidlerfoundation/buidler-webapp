import { ethers, utils } from "ethers";
import { SendData } from "renderer/models";
import MinABI from "./MinABI";

class MetamaskUtils {
  connected = false;
  init(
    onDisconnect: () => void,
    onUpdate: (data: any) => void,
    onConnected: () => void
  ) {
    if (window.ethereum?.isConnected()) {
      onConnected();
      this.metamaskListener(onDisconnect, onUpdate);
    } else {
      window.ethereum?.on("connect", () => {
        onConnected();
        this.metamaskListener(onDisconnect, onUpdate);
      });
    }
  }

  metamaskListener(onDisconnect: () => void, onUpdate: (data: any) => void) {
    window.ethereum?.on("disconnect", onDisconnect);
    window.ethereum?.on("accountsChanged", onUpdate);
    window.ethereum?.on("chainChanged", onUpdate);
  }

  sendETHTransaction = async (sendData: SendData, from: string) => {
    if (!window.ethereum?.selectedAddress) {
      await window.ethereum?.request({
        method: "eth_requestAccounts",
      });
    }
    const amount = ethers.BigNumber.from(
      `${
        parseFloat(`${sendData.amount || 0}`) *
        Math.pow(10, sendData.asset?.contract.decimals || 0)
      }`
    );
    const transactionParameters = {
      gasPrice: sendData.gasPrice?.toHexString(),
      gas: sendData.gasLimit.toHexString(),
      to: sendData.recipientAddress,
      from,
      value: amount.toHexString(),
    };
    return window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
  };

  sendERC20Transaction = async (sendData: SendData, from: string) => {
    if (!window.ethereum?.selectedAddress) {
      await window.ethereum?.request({
        method: "eth_requestAccounts",
      });
    }
    const amount = ethers.BigNumber.from(
      `${
        parseFloat(`${sendData.amount || 0}`) *
        Math.pow(10, sendData.asset?.contract.decimals || 0)
      }`
    );
    const inf = new utils.Interface(MinABI);
    const transferData = inf.encodeFunctionData("transfer", [
      sendData.recipientAddress,
      amount.toHexString(),
    ]);

    const transactionParameters = {
      gasPrice: sendData.gasPrice?.toHexString(),
      gas: sendData.gasLimit.toHexString(),
      to: sendData.asset?.contract.contract_address,
      from,
      value: "0x00",
      data: transferData,
    };

    return window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
  };
}

export default new MetamaskUtils();
