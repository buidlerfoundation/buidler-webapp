import { ICast } from "models/FC";

export const regexUrl =
  /(\b(?:https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,256}((?:\/\S*)?(?:\?\S*)?\b)?([&/#]*)?)/gim;

export const insertHttpIfNeed = (str?: string) => {
  if (!str) return "";
  if (str.includes("http")) {
    return str;
  }
  return `https://${str}`;
};

export const normalizeContentUrl = (string: string, boldUrl?: string) => {
  return string
    .split(" ")
    .map((str) => {
      if (str.includes("..") || (str.includes("@") && !str.includes("/")))
        return str;
      const href = insertHttpIfNeed(str.match(regexUrl)?.[0]);
      return str.replace(
        regexUrl,
        `<a href='${insertHttpIfNeed(
          str.match(regexUrl)?.[0]
        )}' class='mention-string ${
          href === boldUrl ? "text-smb" : ""
        }' target='_blank' onclick='event.stopPropagation();'>$1</a>`
      );
    })
    .join(" ");
};

export const normalizeContentCast = (cast: ICast) => {
  let res = cast.text;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8");
  const byteArray = encoder.encode(cast.text);
  if (cast.mentions_positions.length > 0) {
    const outputByteArray: any = [];
    let start = 0;
    cast.mentions_positions.forEach((el, idx) => {
      if (cast.mentions?.[idx]) {
        const newByte = Array.from(
          encoder.encode(`@${cast.mentions?.[idx]?.username}`)
        );
        outputByteArray.push(...Array.from(byteArray.slice(start, el)));
        outputByteArray.push(...newByte);
        start = el;
      }
    });
    outputByteArray.push(
      ...Array.from(
        byteArray.slice(
          cast.mentions_positions[cast.mentions_positions.length - 1]
        )
      )
    );
    res = decoder.decode(new Uint8Array(outputByteArray));
  }
  res = res
    .split("\n")
    .map((str) => normalizeContentUrl(str))
    .join("\n");
  cast.mentions.forEach((el) => {
    const regex = new RegExp(`@${el.username}`, "gim");
    res = res.replace(
      regex,
      `<a href='https://warpcast.com/${el.username}' class="mention-string" target='_blank' onclick='event.stopPropagation();'>@${el.username}</a>`
    );
  });
  return res;
};

export const removeProtocol = (url?: string) => {
  if (!url) {
    return "";
  }
  try {
    const urlObj = new URL(url);
    return url.replace(`${urlObj.protocol}//`, "").replace("www.", "");
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

export const capitalize = (str?: string) => {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
};

export const getURLObject = (url?: string) => {
  if (!url) return null;
  try {
    const pattern = /\/+$/;
    const modifiedUrl = insertHttpIfNeed(url).replace(pattern, "");
    const urlParser = new URL(modifiedUrl);
    const hostnameSplit = urlParser.hostname.split(".");
    const siteName = capitalize(hostnameSplit[hostnameSplit.length - 2]);
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

export const getLastIndexOfMention = (s: string) => {
  const mentionRegex =
    /(<a class="mention-string" data-fid=".*?">)(.*?)(<\/a>)/g;
  const mentionMatches = s.match(mentionRegex) || [];
  if (mentionMatches?.length > 0) {
    return s.lastIndexOf(mentionMatches[mentionMatches.length - 1]);
  }
  return -1;
};

export const extractContentMessage = (content: string) => {
  const mentionRegex =
    /<a class="mention-string" data-fid="(.*?)">(.*?)<\/a>/gim;

  const span = document.createElement("span");
  span.innerHTML = content
    .replace(/<div><br><\/div>/gim, "\n")
    .replace(/<div>(.*?)<\/div>/gim, "<br>$1")
    .replace(mentionRegex, `<$1-$2>`)
    .replace(/<br>/gim, "\n");
  const text = span.textContent || span.innerText;
  return text.trim();
};

export const normalizeContentCastToSubmit = (content: string) => {
  const encoder = new TextEncoder();
  const mentionRegexSplit = /(<[0-9].*?-[a-z.@].*?>)/;
  const contentRegexSplit = /<[0-9].*?-[a-z.@].*?>/;
  const mentionRegex = /<([0-9].*?)-[a-z.@].*?>/;
  const splitted = content.split(mentionRegexSplit);
  const mentionData = splitted.reduce<{
    mentions: number[];
    mentionPositions: number[];
  }>(
    (res, value, index) => {
      if (!value) return res;
      const { mentions, mentionPositions } = res;
      const currentPosition =
        mentionPositions?.[mentionPositions.length - 1] || 0;
      const mention = mentionRegex.exec(value)?.[1];
      if (mention) {
        if (mentionPositions.length === 0) {
          mentionPositions.push(0);
        }
        mentions.push(parseInt(mention));
      } else if (index < splitted.length - 1) {
        mentionPositions.push(currentPosition + encoder.encode(value).length);
      }
      return {
        mentions,
        mentionPositions,
      };
    },
    {
      mentions: [],
      mentionPositions: [],
    }
  );
  return {
    ...mentionData,
    content: content
      .split(contentRegexSplit)
      .filter((str) => !!str)
      .join(""),
  };
};
