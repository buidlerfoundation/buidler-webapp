import FastAverageColor from 'fast-average-color';

export const getSpaceBackgroundColor = async (url) => {
  const fac = new FastAverageColor();
  const res = await fac.getColorAsync(url);
  return res.hex;
};

export default {};
