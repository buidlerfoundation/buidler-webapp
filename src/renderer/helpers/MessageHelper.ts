import moment from "moment";

export const normalizeMessage = (messages: Array<any>) => {
  return messages.map((msg, index) => {
    const date = moment(new Date(msg.createdAt)).format("YYYY-MM-DD");
    const dateCompare = messages?.[index + 1]
      ? moment(new Date(messages?.[index + 1].createdAt)).format("YYYY-MM-DD")
      : null;
    if (msg.sender_id !== messages?.[index + 1]?.sender_id) {
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

export const normalizeMessages = (messages: Array<any>) => {
  return messages.reduce((result: Array<any>, val) => {
    const date = moment(new Date(val.createdAt)).format("YYYY-MM-DD");
    const index = result.findIndex((el) => el.date === date);
    if (index >= 0) {
      result[index].messages =
        result[index]?.messages?.length > 0
          ? [...result[index].messages, val]
          : [val];
    } else {
      result.push({ date, messages: [val] });
    }
    return result;
  }, []);
};

export const removeTagHTML = (s: string) => {
  return s.replace(/<div>/g, "<br>").replace(/<\/div>/g, "");
};

export const extractContent = (s: string) => {
  const span = document.createElement("span");
  span.innerHTML = s.replaceAll("<br>", "\n");
  return span.textContent || span.innerText;
};

export const normalizeMessageTextPlain = (text: string) => {
  if (!text) return "";
  let res = text
    .replace(/^#### (.*$)/gim, "$1")
    .replace(/^### (.*$)/gim, "$1")
    .replace(/^## (.*$)/gim, "$1")
    .replace(/^# (.*$)/gim, "$1")
    .replace(/^\> (.*$)/gim, "$1")
    .replace(/\*\*(.*)\*\*/gim, "$1")
    .replace(/\*(.*)\*/gim, "$1")
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, "<br />")
    .replace(
      /((https?|ftps?):\/\/[^"<\s]+)(?![^<>]*>|[^"]*?<\/a)/gim,
      "<a onclick='event.stopPropagation();' target='_blank' href='$1'>$1</a>"
    )
    .replace(/\$mention_location/g, `${window.location.origin}/channels/user`);
  return `<div class='enable-user-select'>${res}</div>`;
};

export const normalizeMessageText = (text: string, wrapParagraph?: boolean) => {
  if (!text) return "";
  let res = text
    .replace(/<br>/gim, "\n")
    .replace(/^#### (.*$)/gim, "<h4>$1</h4>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
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
      "<a onclick='event.stopPropagation();' target='_blank' href='$1'>$1</a>"
    )
    .replace(/\$mention_location/g, `${window.location.origin}/channels/user`);

  if (wrapParagraph) {
    res = res.replace(/^([^<]*)([^<]*)$/gim, "<p>$1</p>");
  }
  return `<div class='enable-user-select'>${res}</div>`;
};

export const getMentionData = (s: string) => {
  const mentionRegex =
    /(<a href="\$mention_location\/\?*)(.*?)(" class="mention-string">)/g;
  const mentionMatches = s.match(mentionRegex);
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
