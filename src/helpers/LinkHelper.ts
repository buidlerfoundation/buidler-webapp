export const OpenSeaURL = "https://opensea.io";

export const buildLinkOpenSea = (slugName: string) =>
  `https://opensea.io/collection/${slugName}`;

export const buildLinkUniSwap = (params: {
  amount: number;
  contract_address: string;
}) =>
  `https://app.uniswap.org/#/swap?exactField=output&exactAmount=${params.amount}&outputCurrency=${params.contract_address}&chain=mainnet`;

export const BuidlerURL = "https://buidler.app";

export const sameDAppURL = (url?: string, dAppUrl?: string) => {
  if (!dAppUrl || !url) return false;
  return url.includes(dAppUrl);
};

export function isUrlValid(string?: string) {
  if (!string) return false;
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "https:";
}
