import { Channel } from "renderer/models";
import store from "renderer/store";

const defaultChannel: Channel = {
  channel_id: "",
  channel_members: [],
  channel_name: "",
  channel_type: "Public",
  notification_type: "",
  seen: true,
};

function getPathNameWithoutPostOrMessage() {
  const { pathname } = window.location;
  const idx = Math.max(pathname.indexOf("/post"), pathname.indexOf("/message"));
  if (idx > 0) return pathname.substring(0, idx);
  return pathname;
}

export const getPostId = () => {
  const { pathname } = window.location;
  return pathname.split("post/")?.[1];
};

export const getCommunityId = () => {
  const pathname = getPathNameWithoutPostOrMessage();
  const index = pathname.lastIndexOf("channels/") + 8;
  const lastIndex = pathname.lastIndexOf("/");
  if (index === lastIndex) return pathname.substring(index + 1);
  return pathname.substring(index + 1, lastIndex);
};

export function getChannelId() {
  const pathname = getPathNameWithoutPostOrMessage();
  const lastIndex = pathname.lastIndexOf("/");
  return pathname.substring(lastIndex + 1);
}

export const getCurrentCommunity = () => {
  if (!store) return null;
  let communityId = getCommunityId();
  const { team, currentTeamId } = store.getState().user;
  if (communityId === "user" || !communityId) {
    communityId = currentTeamId;
  }
  return team?.find((el) => el.team_id === communityId);
};

export const getCurrentChannel = () => {
  if (!store) return defaultChannel;
  const communityId = getCommunityId();
  const channelId = getChannelId();
  const { channelMap } = store.getState().user;
  const channels = channelMap?.[communityId];
  return channels?.find((el) => el.channel_id === channelId) || defaultChannel;
};

export const sleep = (mls: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, mls);
  });
};
