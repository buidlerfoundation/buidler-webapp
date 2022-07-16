export const round = (value: number, afterDot: number) => {
  const p = Math.pow(10, afterDot);
  return Math.floor(value * p) / p;
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

export const formatTokenValue = (
  params: {
    value?: number;
    decimal?: number;
    gap?: number;
  },
  afterDot = 4
) => {
  const { value, decimal, gap = 0 } = params;
  const p = decimal ? Math.pow(10, decimal) : 1;
  const rounded = value ? round((value - gap) / p, afterDot) : 0;
  return rounded;
};

export const formatUSDValue = (
  params: { value?: number; decimal?: number; price?: number; gap?: number },
  afterDot = 2
) => {
  const { value, decimal, price, gap = 0 } = params;
  if (!value || !price) return 0;
  const p = decimal ? Math.pow(10, decimal) : 1;
  const valueUSD = ((value - gap) / p) * price;
  return round(valueUSD, afterDot);
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

export const tokenSymbol = (params: { symbol?: string }) => {
  const { symbol } = params;
  if (!symbol) return "";
  const imagePath = symbol.toLowerCase();
  return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@bea1a9722a8c63169dcc06e86182bf2c55a76bbc/svg/color/${imagePath}.svg`;
};
