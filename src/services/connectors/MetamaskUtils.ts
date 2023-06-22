import { ethers, utils } from "ethers";
import { SendData } from "models/User";
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
      `${Math.floor(
        parseFloat(`${sendData.amount || 0}`) *
          Math.pow(10, sendData.asset?.contract.decimals || 0)
      ).toLocaleString("fullwide", { useGrouping: false })}`
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
      `${Math.floor(
        parseFloat(`${sendData.amount || 0}`) *
          Math.pow(10, sendData.asset?.contract.decimals || 0)
      ).toLocaleString("fullwide", { useGrouping: false })}`
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

  sendERC721Transaction = async (sendData: SendData, from: string) => {
    if (!window.ethereum?.selectedAddress) {
      await window.ethereum?.request({
        method: "eth_requestAccounts",
      });
    }
    const inf = new utils.Interface(MinABI);
    const transferData = inf.encodeFunctionData("transferFrom", [
      from,
      sendData.recipientAddress,
      sendData.nft?.token_id,
    ]);

    const transactionParameters = {
      gasPrice: sendData.gasPrice?.toHexString(),
      gas: sendData.gasLimit.toHexString(),
      to: sendData.nft?.contract_address,
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
