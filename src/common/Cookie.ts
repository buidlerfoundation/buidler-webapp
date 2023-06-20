import { getUniqueId } from "helpers/GenerateUUID";
import { AsyncKey } from "./AppConfig";
import Cookies from "js-cookie";
import { ethers } from "ethers";

export const clearData = (callback = () => {}) => {
  Cookies.remove(AsyncKey.accessTokenKey);
  Cookies.remove(AsyncKey.lastChannelId);
  Cookies.remove(AsyncKey.lastTeamId);
  Cookies.remove(AsyncKey.lastChannelIdByTeamId);
  Cookies.remove(AsyncKey.ivKey);
  Cookies.remove(AsyncKey.encryptedDataKey);
  Cookies.remove(AsyncKey.encryptedSeedKey);
  Cookies.remove(AsyncKey.channelPrivateKey);
  Cookies.remove(AsyncKey.deviceCode);
  Cookies.remove(AsyncKey.lastTimeFocus);
  Cookies.remove(AsyncKey.generatedPrivateKey);
  Cookies.remove(AsyncKey.loginType);
  Cookies.remove(AsyncKey.socketConnectKey);
  Cookies.remove(AsyncKey.draftMessageKey);
  callback();
};

export const setCookie = (key: string, val: any) => {
  return new Promise<void>((resolve, reject) => {
    Cookies.set(key, val);
    return resolve();
  });
};

export const getCookie = async (key: string) => {
  return new Promise<any>((resolve, reject) => {
    const data = Cookies.get(key);
    return resolve(data);
  });
};

export const removeCookie = (key: string) => {
  Cookies.remove(key);
};

export const getDeviceCode = async () => {
  const current = await getCookie(AsyncKey.deviceCode);
  if (typeof current === "string") {
    return current;
  }
  const uuid = getUniqueId();
  setCookie(AsyncKey.deviceCode, uuid);
  return uuid;
};

export const GeneratedPrivateKey = async () => {
  const current = await getCookie(AsyncKey.generatedPrivateKey);
  if (typeof current === "string") {
    return current;
  }
  const { privateKey } = ethers.Wallet.createRandom();
  setCookie(AsyncKey.generatedPrivateKey, privateKey);
  return privateKey;
};

export const getLastChannelIdByCommunityId = async (communityId: string) => {
  const lastChannelIdByTeamIdCookie = await getCookie(
    AsyncKey.lastChannelIdByTeamId
  );
  let channelId = "";
  if (lastChannelIdByTeamIdCookie) {
    try {
      const lastChannelIdByTeamId = JSON.parse(lastChannelIdByTeamIdCookie);
      const channelIdByTeamId = lastChannelIdByTeamId?.[communityId];
      if (channelIdByTeamId) {
        channelId = channelIdByTeamId;
      }
    } catch (error) {
      console.log(error);
    }
  }
  return channelId;
};