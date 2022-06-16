import CryptoJS from 'crypto-js';
import { AsyncKey } from 'renderer/common/AppConfig';
import { getCookie, setCookie } from 'renderer/common/Cookie';

export const getIV = async () => {
  const ivStorage: any = await getCookie(AsyncKey.ivKey);
  if (Object.keys(ivStorage || {}).length === 0) {
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
  if (!data) throw new Error('Data must not be null');
  return CryptoJS.AES.encrypt(data, password, { iv });
};

export const decryptData = (
  encryptedData: any,
  password: string,
  iv: CryptoJS.lib.WordArray
) => {
  if (!encryptedData) throw new Error('Data must not be null');
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
