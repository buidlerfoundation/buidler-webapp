import { ethers, utils } from "ethers";
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
    return window.ethereum?.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
  };

  sendERC20Transaction = async () => {
    const amount = 1000000000000000000;
    const amountHex = ethers.BigNumber.from(amount.toString()).toHexString();
    const gasHex = ethers.BigNumber.from("35000").toHexString();
    const inf = new utils.Interface(MinABI);
    const transferData = inf.encodeFunctionData("transfer", [
      "0x639Ea2A5c71aB079564aa4291a47494ad5650E4F",
      amountHex,
    ]);

    const transactionParameters = {
      gasPrice: "0x061ce9a604",
      gas: gasHex,
      to: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      from: "0x27fA68A776AF552d73C77631Bcfcb8F47b1b62e9",
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
