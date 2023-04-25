import moment from "moment";
import { MessageData, MessageDateData } from "renderer/models";

export const normalizeMessage = (messages: Array<any>) => {
  return messages.map((msg, index) => {
    const date = moment(new Date(msg.createdAt)).format("YYYY-MM-DD");
    const dateCompare = messages?.[index + 1]
      ? moment(new Date(messages?.[index + 1].createdAt)).format("YYYY-MM-DD")
      : null;
    if (
      msg.sender_id !== messages?.[index + 1]?.sender_id ||
      !!messages?.[index + 1]?.task
    ) {
      msg.isHead = true;
    }
    if (
      msg.sender_id === messages?.[index + 1]?.sender_id &&
      date !== dateCompare
    ) {
      msg.isHead = true;
    }
    return msg;
  });
};

export const normalizeMessages = (messages: Array<MessageData>) => {
  return messages.reduce(
    (result: Array<MessageData | MessageDateData>, val, idx) => {
      const previousVal: any = messages?.[idx - 1];
      const previousDate =
        previousVal && !previousVal.type
          ? moment(new Date(previousVal.createdAt)).format("YYYY-MM-DD")
          : null;
      const date = moment(new Date(val.createdAt)).format("YYYY-MM-DD");
      if (previousDate && previousDate !== date) {
        result.push({ type: "date", value: previousDate }, val);
      } else {
        result.push(val);
      }
      return result;
    },
    []
  );
};

export const removeTagHTML = (s: string) => {
  return s.replace(/<div>/g, "<br>").replace(/<\/div>/g, "");
};

export const extractContent = (s: string) => {
  const span = document.createElement("span");
  span.innerHTML = s
    .replace(/<div>(.*?)<\/div>/gim, "<br>$1")
    .replace(/<br>/gim, "\n");
  return span.textContent || span.innerText;
};

export const extractContentMessage = (s: string) => {
  const span = document.createElement("span");
  span.innerHTML = s
    .replace(/<div>(.*?)<\/div>/gim, "<br>$1")
    .replace(
      /(<a href="\$mention_location\/)(.*?)(" class="mention-string">)(.*?)(<\/a>)/gim,
      `<$4-$2>`
    )
    .replace(
      /(<a href='\$mention_location\/)(.*?)(' class='mention-string'>)(.*?)(<\/a>)/gim,
      `<$4-$2>`
    )
    .replace(/(<a )(.*?)( class="mention-string">)(.*?)(<\/a>)/gim, `<$4-$2>`)
    .replace(/<br>/gim, "\n");
  const text = span.textContent || span.innerText;
  return text.replace(
    /(<#)(.*?)(-href=)(.*?)(>)/gim,
    `<a href=$4 class="mention-string">#$2</a>`
  );
};

export const normalizeMessageTextPlain = (
  text: string,
  messageReply?: boolean,
  isEdited?: boolean
) => {
  if (!text) return "";
  let res = text
    .replace(/^#### (.*$)/gim, "$1")
    .replace(/^### (.*$)/gim, "$1")
    .replace(/^## (.*$)/gim, "$1")
    .replace(/^# (.*$)/gim, "$1")
    .replace(/^> (.*$)/gim, "$1")
    .replace(/\*\*(.*)\*\*/gim, "$1")
    .replace(/\*(.*)\*/gim, "$1")
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, "<br />");

  if (messageReply) {
    res = res.replace(/(<@)(.*?)(-)(.*?)(>)/gim, `@$2`);
  } else {
    res = res
      .replace(
        /((https?|ftps?):\/\/[^"<\s]+)(?![^<>]*>|[^"]*?<\/a)/gim,
        "<a class='text-ellipsis' style='white-space: pre-line;' href='$1'>$1</a>"
      )
      .replace(/\$mention_location/g, `${window.location.origin}/channels/user`)
      .replace(
        /(<@)(.*?)(-)(.*?)(>)/gim,
        `<a href="${window.location.origin}/channels/user/$4" class="mention-string">@$2</a>`
      );
  }
  return `<div class='enable-user-select'>${res}${
    isEdited ? ' <span class="edited-string">edited</span>' : ""
  }</div>`;
};

export const normalizeMessageText = (
  text: string,
  wrapParagraph?: boolean,
  messageEdit?: boolean,
  isEdited?: boolean
) => {
  if (!text) return "";
  if (messageEdit) {
    return text
      .replace(
        /(<@)(.*?)(-)(.*?)(>)/gim,
        `<a href="${window.location.origin}/channels/user/$4" class="mention-string">@$2</a>`
      )
      .replace(/href=".*?\/channels\/user/g, `href="$mention_location`);
  }
  let res = text
    .replace(/<br>/gim, "\n")
    .replace(/\n- (.*)/gim, "\n  • $1")
    .replace(/^#### (.*$)(\n)/gim, "<h4>$1</h4>")
    .replace(/^#### (.*$)/gim, "<h4>$1</h4>")
    .replace(/^### (.*$)(\n)/gim, "<h3>$1</h3>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)(\n)/gim, "<h2>$1</h2>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)(\n)/gim, "<h1>$1</h1>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>")
    .replace(/\*(.*)\*/gim, "<i>$1</i>")
    .replace(
      /!\[(.*?)\]\((.*?)\)/gim,
      "<p><img class='image-inline' alt='$1' src='$2' /></p>"
    )
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, "<br />")
    .replace(
      /((https?|ftps?):\/\/[^"<\s]+)(?![^<>]*>|[^"]*?<\/a)/gim,
      "<a href='$1'>$1</a>"
    )
    .replace(/\$mention_location/g, `${window.location.origin}/channels/user`)
    .replace(
      /(<@)(.*?)(-)(.*?)(>)/gim,
      `<a href="${window.location.origin}/channels/user/$4" class="mention-string">@$2</a>`
    );

  if (wrapParagraph) {
    res = res.replace(/^([^<]*)([^<]*)$/gim, "<p>$1</p>");
  }
  return `<div class='enable-user-select'>${res}${
    isEdited ? ' <span class="edited-string">edited</span>' : ""
  }</div>`;
};

export const getMentionData = (s: string) => {
  const mentionRegex =
    /(<a href="\$mention_location\/\?*)(.*?)(" class="mention-string">)/g;
  const mentionMatches = s.replace(/'/g, '"').match(mentionRegex);
  return mentionMatches?.map((el) => {
    const match =
      /(<a href="\$mention_location\/\?*)(.*?)(" class="mention-string">)/.exec(
        el
      );
    return {
      mention_id: match?.[2],
      tag_type: "User",
    };
  });
};

export const getLastIndexOfMention = (s: string) => {
  const mentionRegex = /(<a href="\$mention_location.*?">)(.*?)(<\/a>)/g;
  const mentionMatches = s.match(mentionRegex) || [];
  if (mentionMatches?.length > 0) {
    return s.lastIndexOf(mentionMatches[mentionMatches.length - 1]);
  }
  return -1;
};

export const newMessages = (v1: Array<any>, v2: Array<any>) => {
  if (!v1 || v1.length === 0) return v2;
  const latestId = v1[0].message_id;
  const index = v2.findIndex((el: any) => el.message_id === latestId);
  return v2.slice(0, index);
};

export const normalizeUserName = (str: string, length = 5) => {
  if (str?.length > 20) {
    return `${str.substring(0, length)}...${str.substring(
      str.length - length,
      str.length
    )}`;
  }
  return str;
};

export const normalizeMemberUserName = (str: string, length = 5) => {
  if (/^[^.]+\.\.\..*[^-_.]$/.test(str)) {
    return `${str.substring(0, length)}...${str.substring(
      str.length - length,
      str.length
    )}`;
  }
  return str;
};

export const parseMessage = (message: string) => {
  const links = message.match(
    /((https?|ftps?):\/\/[^"<\s]+)(?![^<>]*>|[^"]*?<\/a)/gim
  );
  const addresses = message.match(/0x[a-f0-9A-F]{40}/gim);
  return {
    links,
    addresses,
  };
};
