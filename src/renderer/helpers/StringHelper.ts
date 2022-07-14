import numeral from "numeral";

export const isNotFormat = (number: string | number) => {
  const str = `${number}`;
  const splitted = str.split(".");
  return (
    splitted.length === 2 &&
    (parseInt(splitted[1]) === 0 || isNaN(parseInt(splitted[1])))
  );
};

export const formatNumber = (number: string | number) => {
  if (!number) return "";
  if (isNotFormat(number)) {
    const str = `${number}`;
    if (str.includes(".")) {
      const splitted = str.split(".");
      return `${numeral(splitted[0]).format("0,0")}.${splitted[1]}`;
    }
    return number;
  }
  return numeral(number).format("0,0[.][0000]");
};
