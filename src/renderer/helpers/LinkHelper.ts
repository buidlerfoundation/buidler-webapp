export const OpenSeaURL = "https://opensea.io";

export const buildLinkOpenSea = (slugName: string) =>
  `https://opensea.io/collection/${slugName}`;

export const buildLinkUniSwap = (params: {
  amount: number;
  contract_address: string;
}) =>
  `https://app.uniswap.org/#/swap?exactField=output&exactAmount=${params.amount}&outputCurrency=${params.contract_address}&chain=mainnet`;

export const BuidlerURL = "https://buidler.app";
