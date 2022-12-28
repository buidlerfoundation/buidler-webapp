import { getCookie, setCookie } from "renderer/common/Cookie";
import { AsyncKey } from "renderer/common/AppConfig";
import store from "renderer/store";
import { uniqBy } from "lodash";
import { decrypt, encrypt } from "eciesjs";
import CryptoJS from "crypto-js";
import api from "renderer/api";
import { Channel, UserData } from "renderer/models";
import { getUniqueId } from "./GenerateUUID";

export const encryptMessage = async (str: string, key: string) => {
  return CryptoJS.AES.encrypt(str, key).toString();
};

export const decryptMessage = async (str: string, key: string) => {
  return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
};

const memberData = async (member: UserData, key: string, timestamp: number) => {
  const encryptedKey = encrypt(member.user_id, Buffer.from(key)).toString(
    "hex"
  );
  return {
    key: encryptedKey,
    timestamp,
    user_id: member.user_id,
  };
};

export const createMemberChannelData = async (members: Array<any>) => {
  const uuid = getUniqueId();
  const timestamp = Math.round(new Date().getTime() / 1000);
  const req = members.map((el) => memberData(el, uuid, timestamp));
  const res = await Promise.all(req);
  return { res, uuid };
};

export const getChannelPrivateKey = async (
  encrypted: string,
  privateKey: string
) => {
  const res = decrypt(privateKey, Buffer.from(encrypted, "hex")).toString();
  return res;
};

export const getRawPrivateChannel = async () => {
  const current = await getCookie(AsyncKey.channelPrivateKey);
  let res: any = {};
  if (typeof current === "string") {
    res = JSON.parse(current);
  }
  return res;
};

export const storePrivateChannel = async (
  channelId: string,
  key: string,
  timestamp: number
) => {
  const current = await getCookie(AsyncKey.channelPrivateKey);
  let res: any = {};
  if (typeof current === "string") {
    res = JSON.parse(current);
  }
  res[channelId] = uniqBy(
    [...(res?.[channelId] || []), { key, timestamp }],
    "key"
  );
  setCookie(AsyncKey.channelPrivateKey, JSON.stringify(res));
};

const decryptPrivateChannel = async (item: any, privateKey: string) => {
  const { channelId, key, timestamp } = item;
  const decryptedKey = decrypt(privateKey, Buffer.from(key || "", "hex"));
  return {
    key: decryptedKey.toString(),
    timestamp,
    channelId,
  };
};

export const getPrivateChannel = async (privateKey: string) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  let lastSyncChannel = "0";
  const lastSyncChannelKey = await getCookie(AsyncKey.lastSyncChannelKey);
  if (typeof lastSyncChannelKey === "string") {
    lastSyncChannel = lastSyncChannelKey;
  }
  const channelKeyRes = await api.getChannelKey(lastSyncChannel);
  const syncChannelKey = channelKeyRes.data?.map((el) => ({
    channelId: el.channel_id,
    key: el.key,
    timestamp: el.timestamp,
  })) || [];
  const current = await getCookie(AsyncKey.channelPrivateKey);
  let dataLocal: any = { data: [] };
  if (typeof current === "string") {
    dataLocal = JSON.parse(current);
  }
  dataLocal = uniqBy([...dataLocal.data, ...syncChannelKey], "key");
  await setCookie(
    AsyncKey.channelPrivateKey,
    JSON.stringify({ data: dataLocal })
  );
  await setCookie(AsyncKey.lastSyncChannelKey, timestamp.toString());
  const req = dataLocal.map((el) => decryptPrivateChannel(el, privateKey));
  const res = await Promise.all(req);
  return res.reduce((result, val) => {
    const { channelId, key, timestamp } = val;
    if (result[channelId]) {
      const prev = result[channelId];
      prev[prev.length - 1] = { ...prev[prev.length - 1], expire: timestamp };
      result[channelId] = [...prev, { key, timestamp }];
    } else {
      result[channelId] = [{ key, timestamp }];
    }
    return result;
  }, {});
};

export const normalizePublicMessageItem = (item: any, key: string) => {
  const content = item.content
    ? CryptoJS.AES.decrypt(item.content, key).toString(CryptoJS.enc.Utf8)
    : "";
  if (item?.conversation_data) {
    item.conversation_data = normalizePublicMessageItem(
      item.conversation_data,
      key
    );
  }
  return {
    ...item,
    content,
  };
};

export const normalizeMessageItem = async (
  item: any,
  key: string,
  channelId: string
) => {
  const content = item.content
    ? CryptoJS.AES.decrypt(item.content, key).toString(CryptoJS.enc.Utf8)
    : "";
  if (item?.conversation_data) {
    item.conversation_data = await normalizeMessageItem(
      item.conversation_data,
      key,
      channelId
    );
  }
  return {
    ...item,
    content,
  };
};

export const normalizePublicMessageData = (
  messages?: Array<any>,
  encryptMessageKey?: string
) => {
  const configs: any = store.getState()?.configs;
  const { privateKey } = configs;
  const decryptMessageKey = decrypt(
    privateKey,
    Buffer.from(encryptMessageKey || "", "hex")
  );
  const res =
    messages?.map?.((el) =>
      normalizePublicMessageItem(el, decryptMessageKey.toString())
    ) || [];
  return res.filter(
    (el) => !!el.content || el?.message_attachments?.length > 0
  );
};

export const findKey = (keys: Array<any>, created: number) => {
  return keys.find((el) => {
    if (el.expire) {
      return el.timestamp <= created && el.expire >= created;
    }
    return true;
  });
};

export const normalizeMessageData = async (
  messages: Array<any>,
  channelId: string
) => {
  const configs = store.getState()?.configs;
  const { channelPrivateKey } = configs;
  const keys = channelPrivateKey?.[channelId] || [];
  if (keys.length === 0) return [];
  const req = messages.map((el) =>
    normalizeMessageItem(
      el,
      findKey(keys, Math.round(new Date(el.createdAt).getTime() / 1000)).key,
      channelId
    )
  );
  const res = await Promise.all(req);
  return res.filter(
    (el) => !!el.content || el?.message_attachments?.length > 0
  );
};

export const uniqChannelPrivateKey = async () => {
  const current = await getCookie(AsyncKey.channelPrivateKey);
  let dataLocal: any = {};
  if (typeof current === "string") {
    dataLocal = JSON.parse(current);
    const newObj: any = {};
    Object.keys(dataLocal).forEach((k) => {
      newObj[k] = uniqBy(dataLocal[k], "key");
    });
    setCookie(AsyncKey.channelPrivateKey, JSON.stringify(newObj));
  }
};

export const spaceNameToAvatar = (name: string) => {
  if (!name.trim()) return "B";
  const split = name.trim().split(" ");
  if (split.length > 1) return `${split[0].charAt(0)}${split[1].charAt(0)}`;
  return `${split[0].charAt(0)}`;
};

export const validateUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );

export const sortChannel = (v1: Channel, v2: Channel) => {
  if ((v1.updatedAt || "") > (v2.updatedAt || "")) return -1;
  if ((v1.updatedAt || "") < (v2.updatedAt || "")) return 1;
  return 0;
};
