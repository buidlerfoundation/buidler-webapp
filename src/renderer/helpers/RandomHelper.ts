import data from 'emoji-mart/data/google.json';

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};

export const randomEmoji = () => {
  const randomCate = getRandomInt(8);
  const cate = data.categories[randomCate];
  const { emojis } = cate;
  const idx = getRandomInt(emojis.length);
  return emojis[idx];
};
