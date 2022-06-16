import numeral from 'numeral';

export const formatNumber = (number: string | number) => {
  if (!number) return '';
  return numeral(number).format('0,0');
};

export default {};
