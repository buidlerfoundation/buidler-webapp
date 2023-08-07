import { matchPath } from "react-router-dom";

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
  const match = matchPath(
    "/:page_name/:match_community_id/:match_channel_id",
    window.location.pathname
  );
  return match?.params;
};

export const getShareIdFromPath = () => {
  const match = matchPath(
    "/:share_id",
    window.location.pathname
  );
  return match?.params?.share_id;
};

export const getLogoFromUrl = (url: string) => {
  const obj = getURLObject(url);
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${obj.domain}&size=256`;
};
