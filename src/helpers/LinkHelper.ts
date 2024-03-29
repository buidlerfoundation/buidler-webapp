import { IMetadataUrl } from "models/FC";

const { parser } = require("html-metadata-parser");

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

export const getURLObject = (url: string) => {
  const pattern = /\/+$/;
  const modifiedUrl = url.replace(pattern, "");
  const urlParser = new URL(modifiedUrl);
  const hostnameSplit = urlParser.hostname.split(".");
  const pathSplit = urlParser.pathname.split("/");

  const protocol = urlParser.protocol;
  let subdomain = "";
  let domain = "";
  if (urlParser.hostname.includes("com.vn")) {
    subdomain = hostnameSplit.length > 3 ? hostnameSplit[0] : "www";
    domain =
      hostnameSplit.length > 3
        ? hostnameSplit.slice(1, hostnameSplit.length).join(".")
        : hostnameSplit.join(".");
  } else {
    subdomain = hostnameSplit.length > 2 ? hostnameSplit[0] : "www";
    domain =
      hostnameSplit.length > 2
        ? hostnameSplit.slice(1, hostnameSplit.length).join(".")
        : hostnameSplit.join(".");
  }
  let modifiedPath = `${pathSplit.slice(0, -1).join("/")}`;
  const filename = pathSplit.slice(-1).join("/");
  if (!filename.includes("index.")) {
    modifiedPath = `${modifiedPath}/${filename}`;
  }
  const search = urlParser.search;
  const hash = urlParser.hash;
  return {
    protocol,
    subdomain,
    domain,
    path: modifiedPath,
    search,
    hash,
    full_url: `${protocol}//${urlParser.hostname}${modifiedPath}`,
    community_url: `${domain}`,
    space_url: `${subdomain}.${domain}`,
    channel_url: `${subdomain}.${domain}${modifiedPath}${search}${hash}`,
  };
};

export const getParamsFromPath = () => {
  return {};
};

export const getShareIdFromPath = () => {
  return {};
};

export const getMetadataFromServer: (
  url: string
) => Promise<IMetadataUrl> = async (url: string) => {
  const res = await parser(url);
  const urlObj = new URL(url);
  const domain = urlObj.origin;
  const { meta, og } = res;
  const metadata: IMetadataUrl = {
    image: og?.image
      ? og?.image?.includes("http")
        ? og?.image
        : `https://${domain}${og?.image}`
      : null,
    title: og?.title || meta?.title || null,
    description: og?.description || meta?.description || null,
    card: og?.card || null,
    logo: og?.logo || null,
    site_name: og?.site_name || null,
  };
  return metadata;
};
