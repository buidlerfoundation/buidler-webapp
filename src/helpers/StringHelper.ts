import numeral from "numeral";

export const spaceNameToAvatar = (name: string) => {
  if (!name.trim()) return "B";
  const split = name.trim().split(" ");
  if (split.length > 1) return `${split[0].charAt(0)}${split[1].charAt(0)}`;
  return `${split[0].charAt(0)}`;
};

export const formatAmount = (amount: string) => {
  const splitted = amount.split(".");
  if (splitted.length === 2) {
    return `${splitted[0]}.${splitted[1].substring(0, 5)}`;
  }
  return amount;
};

export const isNotFormat = (number: string | number) => {
  const str = `${number}`;
  const splitted = str.split(".");
  const strAfterDot = splitted?.[1]?.substring(0, 5);
  return (
    splitted.length === 2 &&
    (parseInt(strAfterDot) === 0 || isNaN(parseInt(strAfterDot)))
  );
};

export const formatNumber = (
  number: string | number,
  removeZero = true,
  decimal = 5
) => {
  if (!number) return "";
  const str = `${number}`.includes("e")
    ? number.toLocaleString("fullwide", { useGrouping: false })
    : `${number}`;
  if (str.includes(".")) {
    const splitted = str.split(".");
    const res = `${numeral(splitted[0]).format("0,0")}.${splitted[1].substring(
      0,
      decimal
    )}`;
    if (removeZero) {
      return res.replace(/0*$/g, "");
    }
    return res;
  }
  return numeral(str).format("0,0");
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

export const humanFormatNumber = (num?: number) => {
  if (!num) return "";
  return numeral(num).format("0[.][0]a");
};

export const normalizeName = (userName?: string) => {
  if (!userName) return "";
  if (userName.length === 42) {
    return `0x${userName.slice(37)}`;
  }
  return userName;
};

export function validateEmail(mail: string) {
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  return false;
}
