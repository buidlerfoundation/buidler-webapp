import { SendData } from "renderer/models";

class EthereumUtils {
  sendERC721Transaction = async (sendData: SendData, from: string) => {};
  sendETHTransaction = (sendData: SendData, from: string) => {};
  sendERC20Transaction = async (sendData: SendData, from: string) => {};
}

export default new EthereumUtils();
