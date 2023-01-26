import { SendData } from "renderer/models";
import { Web3Auth } from "@web3auth/modal";

class Web3AuthUtils {
  web3auth: Web3Auth | null = null;
  provider: any = null;


  async init() {
    this.web3auth = new Web3Auth({
      clientId: process.env.REACT_APP_WEB3_AUTH_CLIENT_ID,
      chainConfig: {
        chainNamespace: "eip155",
        chainId: process.env.REACT_APP_DEFAULT_CHAIN_ID,
      },
    });
    await this.web3auth?.initModal();
  }

  disconnect() {
    this.web3auth?.logout();
  }

  sendERC721Transaction = async (sendData: SendData, from: string) => {};
  sendETHTransaction = (sendData: SendData, from: string) => {};
  sendERC20Transaction = async (sendData: SendData, from: string) => {};
}

export default new Web3AuthUtils();
