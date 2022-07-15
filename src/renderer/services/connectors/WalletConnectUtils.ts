import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { ethers, utils } from "ethers";
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

  sendETHTransaction = () => {
    const amount = 1000000000000000;
    const amountHex = ethers.BigNumber.from(amount.toString()).toHexString();
    const gasHex = ethers.BigNumber.from("21000").toHexString();
    const transactionParameters = {
      gasPrice: "0x061ce9a604",
      gas: gasHex,
      to: "0x639Ea2A5c71aB079564aa4291a47494ad5650E4F",
      from: "0x27fA68A776AF552d73C77631Bcfcb8F47b1b62e9",
      value: amountHex,
    };
    return this.connector?.sendTransaction(transactionParameters);
  };

  sendERC20Transaction = async () => {
    const amount = 1000000;
    const amountHex = ethers.BigNumber.from(amount.toString()).toHexString();
    const gasHex = ethers.BigNumber.from("35000").toHexString();
    const inf = new utils.Interface(MinABI);
    const transferData = inf.encodeFunctionData("transfer", [
      "0x639Ea2A5c71aB079564aa4291a47494ad5650E4F",
      amountHex,
    ]);

    const customRequest = {
      id: 1337,
      jsonrpc: "2.0",
      method: "eth_sendTransaction",
      params: [
        {
          gasPrice: "0x061ce9a604",
          gas: gasHex,
          to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          from: "0x27fA68A776AF552d73C77631Bcfcb8F47b1b62e9",
          value: "0x00",
          data: transferData,
        },
      ],
    };

    return this.connector?.sendCustomRequest(customRequest);
  };
}

export default new WalletConnectUtils();
