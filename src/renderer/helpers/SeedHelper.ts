export const createConfirmSeedState = () => {
  return new Array(12).fill({}).map((_, index) => ({ index, title: '' }));
};

export const isValidPrivateKey = (key: string) => {
  if (key.length === 52) {
    return key.match(/^[0-9A-Za-z]{52}$/);
  }
  const regex = /^[0-9A-Fa-f]{64}$/;
  return key.match(regex);
};
