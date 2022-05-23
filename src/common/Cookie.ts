import Cookies from "js-cookie";
import { getUniqueId } from "helpers/GenerateUUID";
import { AsyncKey } from "./AppConfig";

export const clearData = () => {
  Cookies.remove(AsyncKey.accessTokenKey);
  Cookies.remove(AsyncKey.channelPrivateKey);
  Cookies.remove(AsyncKey.deviceCode);
  Cookies.remove(AsyncKey.encryptedDataKey);
  Cookies.remove(AsyncKey.encryptedSeedKey);
  Cookies.remove(AsyncKey.ivKey);
  Cookies.remove(AsyncKey.lastChannelId);
  Cookies.remove(AsyncKey.lastTeamId);
  Cookies.remove(AsyncKey.lastTimeFocus);
};

export const setCookie = (key: string, val: any) => {
  Cookies.set(key, val);
};

export const getCookie = (key: string) => {
  return Cookies.get(key);
};

export const getDeviceCode = () => {
  const current = getCookie(AsyncKey.deviceCode);
  if (typeof current === "string") {
    return current;
  }
  const uuid = getUniqueId();
  setCookie(AsyncKey.deviceCode, uuid);
  return uuid;
};
