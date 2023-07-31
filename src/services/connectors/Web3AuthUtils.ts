import { SendData } from "models/User";
import { Web3Auth } from "@web3auth/modal";
import { ethers, utils } from "ethers";
import MinABI from "./MinABI";

class Web3AuthUtils {
  web3auth: Web3Auth | null = null;
  provider: any = null;

  async init() {
    this.web3auth = new Web3Auth({
      clientId: process.env.REACT_APP_WEB3_AUTH_CLIENT_ID || "",
      chainConfig: {
        chainNamespace: "eip155",
        chainId: `0x${parseInt(
          process.env.REACT_APP_DEFAULT_CHAIN_ID || "0"
        ).toString(16)}`,
      },
    });
    await this.web3auth?.initModal();
  }

  disconnect() {
    this.web3auth?.logout({ cleanup: true });
    this.web3auth?.clearCache();
  }

  sendERC721Transaction = async (sendData: SendData, from: string) => {
    if (!this.provider || !this.web3auth) {
      await this.init();
      const web3authProvider = await this.web3auth?.connect();
      if (!web3authProvider) return;
      this.provider = new ethers.providers.Web3Provider(web3authProvider);
    }
    const signer = this.provider.getSigner();
    const inf = new utils.Interface(MinABI);
    const transferData = inf.encodeFunctionData("transferFrom", [
      from,
      sendData.recipientAddress,
      sendData.nft?.token_id,
    ]);
    const transactionParameters = {
      gasPrice: sendData.gasPrice?.toHexString(),
      gasLimit: sendData.gasLimit.toHexString(),
      to: sendData.nft?.contract_address,
      from,
      value: "0x0",
      data: transferData,
    };
    return signer.sendTransaction(transactionParameters);
  };
  sendETHTransaction = async (sendData: SendData, from: string) => {
    if (!this.provider || !this.web3auth) {
      await this.init();
      const web3authProvider = await this.web3auth?.connect();
      if (!web3authProvider) return;
      this.provider = new ethers.providers.Web3Provider(web3authProvider);
    }
    const signer = this.provider.getSigner();
    const amount = ethers.BigNumber.from(
      `${Math.floor(
        parseFloat(`${sendData.amount || 0}`) *
          Math.pow(10, sendData.asset?.contract.decimals || 0)
      ).toLocaleString("fullwide", { useGrouping: false })}`
    );
    const transactionParameters = {
      gasPrice: sendData.gasPrice?.toHexString(),
      gasLimit: sendData.gasLimit.toHexString(),
      to: sendData.recipientAddress,
      from,
      value: amount.toHexString(),
    };
    return signer.sendTransaction(transactionParameters);
  };
  sendERC20Transaction = async (sendData: SendData, from: string) => {
    if (!this.provider || !this.web3auth) {
      await this.init();
      const web3authProvider = await this.web3auth?.connect();
      if (!web3authProvider) return;
      this.provider = new ethers.providers.Web3Provider(web3authProvider);
    }
    const signer = this.provider.getSigner();
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
      gasLimit: sendData.gasLimit.toHexString(),
      to: sendData.asset?.contract.contract_address,
      from,
      value: "0x0",
      data: transferData,
    };

    return signer.sendTransaction(transactionParameters);
  };
}

export default new Web3AuthUtils();
