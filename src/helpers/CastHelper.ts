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
        )}' class='mention-string' target='_blank'>$1</a>`
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
      `<a href='https://warpcast.com/${el.username}' class="mention-string" target='_blank'>@${el.username}</a>`
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
