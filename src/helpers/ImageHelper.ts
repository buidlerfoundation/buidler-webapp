export const isVideo = (name?: string) => {
  if (!name) return false;
  return /.{0,}(\.mp4|\.mov|\.avi|\.m4v|\.m4p)$/g.test(name);
};

export const isImage = (url?: string) => {
  if (!url) return false;
  return /.{0,}(\.png|\.jpg|\.jpeg|\.gif)$/g.test(url);
};
