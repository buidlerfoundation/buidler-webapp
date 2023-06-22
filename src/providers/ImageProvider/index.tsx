import { ReactNode, createContext, useCallback, useContext } from "react";
import CryptoJS from "crypto-js";
import useAppSelector from "hooks/useAppSelector";
import makeBlockie from "ethereum-blockies-base64";

type imageOptions = {
  w?: number;
  h?: number;
  radius?: number;
  fm?: string;
};

export interface IImageContext {
  normalizeImage: (
    name?: string,
    id?: string,
    options?: imageOptions,
    noParams?: boolean,
    userAvatar?: boolean
  ) => string;
  normalizeEthImage: (address: string) => string;
}

export const ImageContext = createContext<IImageContext>({
  normalizeImage: () => "",
  normalizeEthImage: (address: string) => "",
});

export function useImage(): IImageContext {
  return useContext(ImageContext);
}

interface IImageProps {
  children?: ReactNode;
}

const ImageProvider = ({ children }: IImageProps) => {
  const imgBucket = useAppSelector((state) => state.user.imgBucket);
  const imgDomain = useAppSelector((state) => state.user.imgDomain);
  const buildImagePath = useCallback(
    (
      name?: string,
      id?: string,
      options: imageOptions = {},
      noParams = false,
      userAvatar?: boolean
    ) => {
      const suffix = `plain/gs://${imgBucket}`;
      if (!name && (id?.substring(0, 2) === "0x" || userAvatar)) {
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
    },
    [imgBucket]
  );

  const shouldUseOrigin = useCallback((name?: string) => {
    if (!name) return false;
    return !/.{0,}(\.jpeg|\.png|\.jpg)$/g.test(name);
  }, []);
  const normalizeImage = useCallback(
    (
      name?: string,
      id?: string,
      options: imageOptions = {},
      noParams: boolean = false,
      userAvatar?: boolean
    ) => {
      if (!imgDomain || !imgBucket) return "";
      if (name?.includes("https://")) return name;
      if (shouldUseOrigin(name)) {
        return `https://storage.googleapis.com/${imgBucket}/${id}/${name}`;
      }
      const path = buildImagePath(name, id, options, noParams, userAvatar);
      const message = `${process.env.REACT_APP_IMAGE_SALT}/${path}`;
      const key = `${process.env.REACT_APP_IMAGE_KEY}`;
      const signature = CryptoJS.HmacSHA256(message, key)
        .toString(CryptoJS.enc.Base64)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      const url = `${imgDomain}/${signature}/${path}`;
      return url;
    },
    [buildImagePath, imgBucket, imgDomain, shouldUseOrigin]
  );
  const normalizeEthImage = useCallback((address: string) => {
    return makeBlockie(address);
  }, []);
  return (
    <ImageContext.Provider value={{ normalizeImage, normalizeEthImage }}>
      {children}
    </ImageContext.Provider>
  );
};

export default ImageProvider;
