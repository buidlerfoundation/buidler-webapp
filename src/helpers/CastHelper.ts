import { ICast } from "models/FC";

const regexUrl =
  /((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,256}\b([-a-zA-Z0-9@:%_+.~#(?&//=]*))/gim;

const insertHttpIfNeed = (str?: string) => {
  if (!str) return "";
  if (str.includes("http")) {
    return str;
  }
  return `https://${str}`;
};

export const normalizeContentUrl = (string: string) => {
  return string
    .split(" ")
    .map((str) => {
      if (str.includes("..") || (str.includes("@") && !str.includes("/")))
        return str;
      return str.replace(
        regexUrl,
        `<a href='${insertHttpIfNeed(
          str.match(regexUrl)?.[0]
        )}' class='mention-string' target='_blank' onclick='event.stopPropagation();'>$1</a>`
      );
    })
    .join(" ");
};

export const normalizeContentCast = (cast: ICast) => {
  let res = cast.text;
  if (cast.mentions_positions.length > 0) {
    const output = [];
    let start = 0;
    cast.mentions_positions.forEach((el, idx) => {
      if (cast.mentions?.[idx]) {
        output.push(cast.text.slice(start, el));
        output.push(`@${cast.mentions?.[idx]?.username}`);
        start = el;
      }
    });
    output.push(
      cast.text.slice(
        cast.mentions_positions[cast.mentions_positions.length - 1]
      )
    );
    res = output.join("");
  }
  res = res.split("\n").map(normalizeContentUrl).join("\n");
  cast.mentions.forEach((el) => {
    const regex = new RegExp(`@${el.username}`, "gim");
    res = res.replace(
      regex,
      `<a href='https://warpcast.com/${el.username}' class="mention-string" target='_blank' onclick='event.stopPropagation();'>@${el.username}</a>`
    );
  });
  return res;
};

const removeProtocol = (url: string) => {
  try {
    const urlObj = new URL(url);
    return url.replace(`${urlObj.protocol}//`, "");
  } catch (error) {
    return url;
  }
};

export const compareEmbeddedUrl = (embeddedUrl: string, queryUrl: string) => {
  const eWithoutProtocol = removeProtocol(embeddedUrl);
  const qWithoutProtocol = removeProtocol(queryUrl);
  return (
    eWithoutProtocol.includes(qWithoutProtocol) ||
    qWithoutProtocol.includes(eWithoutProtocol)
  );
};

export const getURLObject = (url?: string) => {
  if (!url) return null;
  try {
    const pattern = /\/+$/;
    const modifiedUrl = url.replace(pattern, "");
    const urlParser = new URL(modifiedUrl);
    const hostnameSplit = urlParser.hostname.split(".");
    const siteName = hostnameSplit[hostnameSplit.length - 2];
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
    const origin = urlParser.origin;
    const host = urlParser.host;

    return {
      protocol,
      subdomain,
      domain,
      path: modifiedPath,
      search,
      hash,
      siteName,
      origin,
      host,
    };
  } catch (error) {
    return null;
  }
};
