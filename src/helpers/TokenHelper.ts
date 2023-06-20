import { BalanceApiData, SendData } from "models/User";
import numeral from "numeral";
import { ethers, utils } from "ethers";
import MinABI from "services/connectors/MinABI";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import AppConfig from "common/AppConfig";

export const round = (value: number, afterDot: number) => {
  const p = Math.pow(10, afterDot);
  return Math.floor(value * p) / p;
};

export const formatToken = (
  params: {
    value?: number;
    symbol?: string;
    decimal?: number;
  },
  afterDot = 5
) => {
  const { value, symbol, decimal } = params;
  const p = decimal ? Math.pow(10, decimal) : 1;
  const rounded = value ? round(value / p, afterDot) : 0;
  if (!symbol) {
    return `${rounded}`;
  }
  return `${rounded} ${symbol.toUpperCase()}`;
};

export const formatTokenValue = (
  params: {
    value?: number;
    decimal?: number;
    gap?: number;
  },
  afterDot = 5
) => {
  const { value, decimal, gap = 0 } = params;
  const p = decimal ? Math.pow(10, decimal) : 1;
  const rounded = value ? round((value - gap) / p, afterDot) : 0;
  return rounded;
};

export const formatUSDValue = (
  params: { value?: number; decimal?: number; price?: number; gap?: number },
  afterDot = 2
) => {
  const { value, decimal, price, gap = 0 } = params;
  if (!value || !price) return 0;
  const p = decimal ? Math.pow(10, decimal) : 1;
  const valueUSD = ((value - gap) / p) * price;
  return round(valueUSD, afterDot);
};

export const formatUSD = (
  params: { value?: number; decimal?: number; price?: number },
  afterDot = 2
) => {
  const { value, decimal, price } = params;
  if (!value || !price) return "$0";
  const p = decimal ? Math.pow(10, decimal) : 1;
  const valueUSD = (value / p) * price;
  return `$${numeral(round(valueUSD, afterDot)).format("0,0[.][00]")}`;
};

export const tokenSymbol = (params: { symbol?: string }) => {
  const { symbol } = params;
  if (!symbol) return "";
  const imagePath = symbol.toLowerCase();
  return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@bea1a9722a8c63169dcc06e86182bf2c55a76bbc/svg/color/${imagePath}.svg`;
};

export const totalBalanceUSD = (userBalance?: BalanceApiData | null) => {
  if (!userBalance) return 0;
  const { coins, tokens } = userBalance;
  let res = 0;
  [...coins, ...tokens].forEach((el) => {
    res += formatUSDValue({
      value: el.balance,
      decimal: el.contract.decimals,
      price: el.price?.current_price,
    });
  });
  return res;
};

export const getTransactionAmount = (sendData: SendData) => {
  const amount = ethers.BigNumber.from(
    `${Math.floor(
      parseFloat(`${sendData.amount || 0}`) *
        Math.pow(10, sendData.asset?.contract.decimals || 0)
    ).toLocaleString("fullwide", { useGrouping: false })}`
  );
  return amount;
};

export const getTransactionData = (
  sendData: SendData,
  typeId: string,
  from: string
) => {
  const inf = new utils.Interface(MinABI);
  let transferData = "0x";
  if (typeId === "1") {
    const amount = ethers.BigNumber.from(
      `${Math.floor(
        parseFloat(`${sendData.amount || 0}`) *
          Math.pow(10, sendData.asset?.contract.decimals || 0)
      ).toLocaleString("fullwide", { useGrouping: false })}`
    );
    transferData = inf.encodeFunctionData("transfer", [
      sendData.recipientAddress || AppConfig.estimateGasRecipientAddress,
      amount.toHexString(),
    ]);
  } else if (typeId === "2") {
    transferData = inf.encodeFunctionData("transferFrom", [
      from,
      sendData.recipientAddress || AppConfig.estimateGasRecipientAddress,
      sendData.nft?.token_id,
    ]);
  }
  return transferData;
};

export const getEstimateTransaction = (
  sendData: SendData,
  typeId: string,
  from: string
) => {
  const transferData = getTransactionData(sendData, typeId, from);
  const res: TransactionRequest = {
    from,
    gasPrice: sendData.gasPrice?.toHexString(),
  };
  if (typeId === "1") {
    if (sendData.asset?.contract.contract_address === "coin") {
      res.to =
        sendData.recipientAddress || AppConfig.estimateGasRecipientAddress;
      res.value = getTransactionAmount(sendData)
        .toHexString()
        .replace(/^(0x)0+/g, "$1");
    } else {
      res.data = transferData;
      res.to = sendData.asset?.contract?.contract_address;
    }
  } else if (typeId === "2") {
    res.data = transferData;
    res.to = sendData.nft?.contract_address;
  }
  return res;
};
