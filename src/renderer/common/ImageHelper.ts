import makeBlockie from "ethereum-blockies-base64";
import CryptoJS from "crypto-js";

type imageOptions = {
  w?: number;
  h?: number;
  radius?: number;
  fm?: string;
};

class ImageHelper {
  imgBucket?: string = "";
  imgDomain?: string = "";

  initial(domain: string, bucket: string) {
    this.imgBucket = bucket;
    this.imgDomain = domain;
  }

  normalizeEthImage = (address) => {
    return makeBlockie(address);
  };
  // https://imgproxy.buidler.app/g4ziYed1cC2q5-ZgCxVENMnUKKG_tGSpDTNaI7BPeSI/plain/gs://buidler/0270a7bf-104c-412b-a739-64915eafd5e7/1643079696521.jpg

  buildImagePath = (
    name?: string,
    id?: string,
    options: imageOptions = {},
    noParams = false
  ) => {
    const suffix = `plain/gs://${this.imgBucket}`;
    if (!name && id?.substring(0, 2) === "0x") {
      return `${suffix}/${id}/ethereum_blockies.png`;
    }
    if (name?.includes?.(".gif") || noParams) {
      return `${suffix}/${id}/${name}`;
    }
    let params = "";
    if (options.w) {
      params += `w:${options.w}/`;
    }
    if (options.h) {
      params += `h:${options.h}/`;
    }
    return `${params}${suffix}/${id}/${name}`;
  };

  isVideo = (name?: string) => {
    if (!name) return false;
    return /.{0,}(\.mp4|\.mov|\.avi|\.m4v|\.m4p)$/g.test(name);
  };

  normalizeImage = (
    name?: string,
    id?: string,
    options: imageOptions = {},
    noParams = false
  ) => {
    if (!this.imgDomain || !this.imgBucket) return "";
    if (this.isVideo(name)) {
      return `https://storage.googleapis.com/${this.imgBucket}/${id}/${name}`;
    }
    const domain = this.imgDomain;
    const path = this.buildImagePath(name, id, options, noParams);
    const message = `${process.env.REACT_APP_IMAGE_SALT}/${path}`;
    const key = `${process.env.REACT_APP_IMAGE_KEY}`;
    const signature = CryptoJS.HmacSHA256(message, key)
      .toString(CryptoJS.enc.Base64)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    const url = `${domain}/${signature}/${path}`;
    return url;
  };
}

export default new ImageHelper();
