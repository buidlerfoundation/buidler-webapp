import CryptoJS from "crypto-js";
import { AsyncKey } from "common/AppConfig";
import { getCookie, setCookie } from "common/Cookie";

export const getIV = async () => {
  const ivStorage: any = getCookie(AsyncKey.ivKey);
  if (!ivStorage) {
    const iv = CryptoJS.lib.WordArray.random(16);
    setCookie(AsyncKey.ivKey, iv);
    return iv;
  }
  return ivStorage;
};

export const encryptData = (
  data: any,
  password: string,
  iv: CryptoJS.lib.WordArray
) => {
  if (!data) throw new Error("Data must not be null");
  return CryptoJS.AES.encrypt(data, password, { iv });
};

export const decryptData = (
  encryptedData: any,
  password: string,
  iv: CryptoJS.lib.WordArray
) => {
  if (!encryptedData) throw new Error("Data must not be null");
  return CryptoJS.AES.decrypt(encryptedData, password, { iv });
};

export const encryptString = (
  string: string,
  password: string,
  iv: CryptoJS.lib.WordArray
) => {
  const encrypted = encryptData(string, password, iv);
  return encrypted.toString();
};

export const decryptString = (
  string: string,
  password: string,
  iv: CryptoJS.lib.WordArray
) => {
  const decrypted = decryptData(string, password, iv);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export default {
  encryptData,
  decryptData,
  encryptString,
  decryptString,
};
