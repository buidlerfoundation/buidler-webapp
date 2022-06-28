import moment from "moment";
import images from "../common/images";

export const normalizeMessage = (messages: Array<any>) => {
  return messages.map((msg, index) => {
    if (msg.sender_id !== messages?.[index + 1]?.sender_id) {
      msg.isHead = true;
    }
    if (msg.parent_id !== messages?.[index + 1]?.parent_id) {
      msg.isConversationHead = true;
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

export const normalizeMessageText = (text: string, isShowNote = false) => {
  if (!text) return "";
  let res = text?.replaceAll?.("<br>", "\n");
  const regexLink = /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |$)/gim;
  const linkMatches = res.match(regexLink);
  linkMatches?.forEach((el) => {
    const linkMatch = /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |$)/.exec(el);
    if (linkMatch && linkMatch?.length >= 5) {
      res = res?.replace(
        el,
        `<a onclick='event.stopPropagation();' target='_blank' href='${extractContent(
          `${linkMatch[1]}://${linkMatch[2]}.${linkMatch[3]}${linkMatch[4]}`
        )}'>${linkMatch[1]}://${linkMatch[2]}.${linkMatch[3]}${
          linkMatch[4]
        }</a>${linkMatch[5]}`
      );
    }
  });
  res = res?.replace?.(
    /\$mention_location/g,
    `${window.location.origin}${window.location.pathname}/channels`
  );
  if (isShowNote) {
    return `<div style='display: flex; align-items: flex-start'><span class='enable-user-select'>${res}</span><img src='${images.icNote}' style='margin-left: 15px; margin-top: 7px' /></div>`;
  }
  return `<span class='enable-user-select'>${res}</span>`;
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
  const mentionRegex = /(<a href="\$mention_location\?)(.*?)(<\/a>)/g;
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

export const normalizeUserName = (str: string) => {
  if (str?.length > 20) {
    return `${str.substring(0, 5)}...${str.substring(
      str.length - 5,
      str.length
    )}`;
  }
  return str;
};
