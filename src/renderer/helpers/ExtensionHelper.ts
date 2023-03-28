export const detectExtension = (extensionId, callback) => {
  var img;
  img = new Image();
  img.src = "chrome-extension://" + extensionId + "/resources/icons/16x16.png";
  img.onload = function () {
    callback(true);
  };
  img.onerror = function () {
    callback(false);
  };
};
