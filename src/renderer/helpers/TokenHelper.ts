export const round = (value: number, afterDot: number) => {
  const p = Math.pow(10, afterDot);
  return Math.round(value * p) / p;
};

export const formatToken = (
  params: {
    value?: number;
    symbol?: string;
    decimal?: number;
  },
  afterDot = 4
) => {
  const { value, symbol, decimal } = params;
  const p = decimal ? Math.pow(10, decimal) : 1;
  const rounded = value ? round(value / p, afterDot) : 0;
  if (!symbol) {
    return `${rounded}`;
  }
  return `${rounded} ${symbol.toUpperCase()}`;
};

export const formatUSD = (
  params: { value?: number; decimal?: number; price?: number },
  afterDot = 2
) => {
  const { value, decimal, price } = params;
  if (!value || !price) return "$0";
  const p = decimal ? Math.pow(10, decimal) : 1;
  const valueUSD = (value / p) * price;
  return `$${round(valueUSD, afterDot)}`;
};

export const tokenSymbol = (params: { name?: string; symbol?: string }) => {
  const { name, symbol } = params;
  if (!name || !symbol) return "";
  const imagePath = `${symbol}-${name}`.replace(/ /g, "-").toLowerCase();
  return `https://cryptocurrencyliveprices.com/img/${imagePath}.png`;
};
