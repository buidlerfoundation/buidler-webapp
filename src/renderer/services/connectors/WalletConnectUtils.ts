import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { ethers, utils } from "ethers";
import { SendData } from "renderer/models";
import MinABI from "./MinABI";

class WalletConnectUtils {
  connector: WalletConnect | null = null;

  init(onDisconnect: () => void) {
    this.connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });
    if (this.connector.connected) {
      this.connector.on("disconnect", onDisconnect);
    }
  }

  async connect(onConnect: () => void, onDisconnect: () => void) {
    this.connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });
    if (this.connector.connected) {
      await this.connector.killSession();
      this.connector.on("disconnect", onDisconnect);
      this.connector.on("connect", onConnect);
      // create new session
      this.connector.createSession();
    } else {
      this.connector.on("disconnect", onDisconnect);
      this.connector.on("connect", onConnect);
      // create new session
      this.connector.createSession();
    }
  }

  disconnect() {
    if (this.connector?.connected) {
      this.connector.killSession();
    }
  }

  sendETHTransaction = (sendData: SendData, from: string) => {
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
    return this.connector?.sendTransaction(transactionParameters);
  };

  sendERC20Transaction = async (sendData: SendData, from: string) => {
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

    const customRequest = {
      id: 1337,
      jsonrpc: "2.0",
      method: "eth_sendTransaction",
      params: [
        {
          gasPrice: sendData.gasPrice?.toHexString(),
          gas: sendData.gasLimit.toHexString(),
          to: sendData.asset?.contract.contract_address,
          from,
          value: "0x00",
          data: transferData,
        },
      ],
    };

    return this.connector?.sendCustomRequest(customRequest);
  };

  sendERC721Transaction = async (sendData: SendData, from: string) => {
    const inf = new utils.Interface(MinABI);
    const transferData = inf.encodeFunctionData("transferFrom", [
      from,
      sendData.recipientAddress,
      sendData.nft?.token_id,
    ]);

    const customRequest = {
      id: 1337,
      jsonrpc: "2.0",
      method: "eth_sendTransaction",
      params: [
        {
          gasPrice: sendData.gasPrice?.toHexString(),
          gas: sendData.gasLimit.toHexString(),
          to: sendData.nft?.contract_address,
          from,
          value: "0x00",
          data: transferData,
        },
      ],
    };

    return this.connector?.sendCustomRequest(customRequest);
  };
}

export default new WalletConnectUtils();
