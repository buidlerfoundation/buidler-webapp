"use client";

import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { ethers } from "ethers";

const createMagic = (key: string) => {
  return (
    typeof window !== "undefined" &&
    new Magic(key, {
      extensions: [new OAuthExtension()],
      network: {
        rpcUrl: "https://mainnet.optimism.io",
        chainId: 10,
      },
    })
  );
};

const magic = createMagic(process.env.NEXT_PUBLIC_MAGIC_API_KEY);

export const magicProvider = magic
  ? new ethers.providers.Web3Provider(magic.rpcProvider as any)
  : null;

export default magic;
