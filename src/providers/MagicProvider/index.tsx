import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { SDKBase, InstanceWithExtensions } from "@magic-sdk/provider";
import { OAuthExtension } from "@magic-ext/oauth";
import { Magic } from "magic-sdk";
import { ethers } from "ethers";

interface IMagicContext {
  magic?: InstanceWithExtensions<SDKBase, OAuthExtension[]>;
  magicProvider?: ethers.providers.Web3Provider;
}

const MagicContext = createContext<IMagicContext>({});

export function useMagic(): IMagicContext {
  return useContext(MagicContext);
}

interface IMagicProvider {
  children: ReactNode;
}

const MagicProvider = ({ children }: IMagicProvider) => {
  const [magic, setMagic] = useState<
    InstanceWithExtensions<SDKBase, OAuthExtension[]> | undefined
  >();
  const [magicProvider, setMagicProvider] = useState<
    ethers.providers.Web3Provider | undefined
  >();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const _magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY, {
        extensions: [new OAuthExtension()],
        network: {
          rpcUrl: "https://mainnet.optimism.io",
          chainId: 10,
        },
      });
      setMagic(_magic);
      setMagicProvider(
        new ethers.providers.Web3Provider(_magic.rpcProvider as any)
      );
    }
  }, []);
  return (
    <MagicContext.Provider value={{ magic, magicProvider }}>
      {children}
    </MagicContext.Provider>
  );
};

export default MagicProvider;
