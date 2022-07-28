import numeral from "numeral";

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

export const formatNumber = (number: string | number) => {
  if (!number) return "";
  const str = `${number}`.includes("e")
    ? number.toLocaleString("fullwide", { useGrouping: false })
    : `${number}`;
  if (str.includes(".")) {
    const splitted = str.split(".");
    return `${numeral(splitted[0]).format("0,0")}.${splitted[1].substring(
      0,
      5
    )}`;
  }
  return numeral(str).format("0,0");
};
