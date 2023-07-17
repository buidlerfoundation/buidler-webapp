import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Web3Modal } from "@web3modal/standalone";
import UniversalProvider from "@walletconnect/universal-provider";
import { PairingTypes, SessionTypes } from "@walletconnect/types";
import Client from "@walletconnect/sign-client";

import { providers } from "ethers";
import AppConfig from "common/AppConfig";
/**
 * Types
 */
interface IContext {
  client: Client | undefined;
  session: SessionTypes.Struct | undefined;
  connect: (caipChainId?: string, pairing?: { topic: string }) => Promise<void>;
  disconnect: () => Promise<void>;
  isInitializing: boolean;
  chain: string;
  pairings: PairingTypes.Struct[];
  accounts: string[];
  web3Provider?: providers.Web3Provider;
}

/**
 * Context
 */
export const WalletConnectContext = createContext<IContext>({} as IContext);

/**
 * Provider
 */
/**
 * Provider
 */
export function WalletConnectProvider({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const [client, setClient] = useState<Client>();
  const [pairings, setPairings] = useState<PairingTypes.Struct[]>([]);
  const [session, setSession] = useState<SessionTypes.Struct>();

  const [ethereumProvider, setEthereumProvider] = useState<UniversalProvider>();
  const [web3Provider, setWeb3Provider] = useState<providers.Web3Provider>();
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasCheckedPersistedSession, setHasCheckedPersistedSession] =
    useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chain, setChain] = useState<string>("");
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();

  const resetApp = () => {
    setPairings([]);
    setSession(undefined);
    setAccounts([]);
    setChain("");
  };

  const disconnect = useCallback(async () => {
    if (typeof ethereumProvider === "undefined") {
      return;
    }
    setAccounts([]);
    await ethereumProvider.disconnect();
    resetApp();
  }, [ethereumProvider]);

  const _subscribeToProviderEvents = useCallback(
    async (_client: UniversalProvider) => {
      if (typeof _client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }

      _client.on("display_uri", async (uri: string) => {
        console.log("EVENT", "QR Code Modal open");
        web3Modal?.openModal({ uri });
      });

      // Subscribe to session ping
      _client.on(
        "session_ping",
        ({ id, topic }: { id: number; topic: string }) => {
          console.log("EVENT", "session_ping");
          console.log(id, topic);
        }
      );

      // Subscribe to session event
      _client.on(
        "session_event",
        ({ event, chainId }: { event: any; chainId: string }) => {
          console.log("EVENT", "session_event");
          console.log(event, chainId);
        }
      );

      // Subscribe to session update
      _client.on(
        "session_update",
        ({
          topic,
          session,
        }: {
          topic: string;
          session: SessionTypes.Struct;
        }) => {
          console.log("EVENT", "session_updated");
          setSession(session);
        }
      );

      // Subscribe to session delete
      _client.on(
        "session_delete",
        ({ id, topic }: { id: number; topic: string }) => {
          console.log("EVENT", "session_deleted");
          console.log(id, topic);
          resetApp();
        }
      );
    },
    [web3Modal]
  );

  const createClient = useCallback(async () => {
    try {
      setIsInitializing(true);

      if (!AppConfig.walletConnectProjectId) return;

      const provider = await UniversalProvider.init({
        projectId: AppConfig.walletConnectProjectId,
      });

      const web3Modal = new Web3Modal({
        projectId: AppConfig.walletConnectProjectId,
        walletConnectVersion: 2,
      });

      setEthereumProvider(provider);
      setClient(provider.client);
      setWeb3Modal(web3Modal);
    } catch (err) {
      throw err;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const createWeb3Provider = useCallback(
    (ethereumProvider: UniversalProvider) => {
      const web3Provider = new providers.Web3Provider(ethereumProvider);
      setWeb3Provider(web3Provider);
    },
    []
  );

  const connect = useCallback(
    async (caipChainId?: string, pairing?: { topic: string }) => {
      if (!ethereumProvider) {
        throw new ReferenceError("WalletConnect Client is not initialized.");
      }

      const _caipChainId = caipChainId || "eip155:1";

      const chainId = _caipChainId.split(":").pop();

      console.log("Enabling EthereumProvider for chainId: ", chainId);

      const session = await ethereumProvider.connect({
        namespaces: {
          eip155: {
            methods: [
              "eth_sendTransaction",
              "eth_signTransaction",
              "eth_sign",
              "personal_sign",
              "eth_signTypedData",
              "eth_signTypedData_v4",
            ],
            chains: [`eip155:${chainId}`],
            events: ["chainChanged", "accountsChanged"],
            rpcMap: {
              chainId: `https://rpc.walletconnect.com?chainId=eip155:${chainId}&projectId=${AppConfig.walletConnectProjectId}`,
            },
          },
        },
        pairingTopic: pairing?.topic,
      });

      createWeb3Provider(ethereumProvider);
      const _accounts = await ethereumProvider.enable();
      console.log("_accounts", _accounts);
      setAccounts(_accounts);
      setSession(session);
      setChain(_caipChainId);

      web3Modal?.closeModal();
    },
    [ethereumProvider, createWeb3Provider, web3Modal]
  );

  const onSessionConnected = useCallback(
    async (_session: SessionTypes.Struct) => {
      if (!ethereumProvider) {
        throw new ReferenceError("EthereumProvider is not initialized.");
      }
      const allNamespaceAccounts = Object.values(_session.namespaces)
        .map((namespace) => namespace.accounts)
        .flat();
      const allNamespaceChains = Object.keys(_session.namespaces);

      const chainData = allNamespaceAccounts[0].split(":");
      const caipChainId = `${chainData[0]}:${chainData[1]}`;
      console.log("restored caipChainId", caipChainId);
      setChain(caipChainId);
      setSession(_session);
      setAccounts(allNamespaceAccounts.map((account) => account.split(":")[2]));
      console.log("RESTORED", allNamespaceChains, allNamespaceAccounts);
      createWeb3Provider(ethereumProvider);
    },
    [ethereumProvider, createWeb3Provider]
  );

  const _checkForPersistedSession = useCallback(
    async (provider: UniversalProvider) => {
      if (typeof provider === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }
      const pairings = provider.client.pairing.getAll({ active: true });
      // populates existing pairings to state
      setPairings(pairings);
      console.log("RESTORED PAIRINGS: ", pairings);
      if (typeof session !== "undefined") return;
      // populates (the last) existing session to state
      if (ethereumProvider?.session) {
        const _session = ethereumProvider?.session;
        console.log("RESTORED SESSION:", _session);
        await onSessionConnected(_session);
        return _session;
      }
    },
    [session, ethereumProvider, onSessionConnected]
  );

  useEffect(() => {
    if (!client) {
      createClient();
    }
  }, [client, createClient]);

  useEffect(() => {
    if (ethereumProvider && web3Modal)
      _subscribeToProviderEvents(ethereumProvider);
  }, [_subscribeToProviderEvents, ethereumProvider, web3Modal]);

  useEffect(() => {
    const getPersistedSession = async () => {
      if (!ethereumProvider) return;
      await _checkForPersistedSession(ethereumProvider);
      setHasCheckedPersistedSession(true);
    };

    if (ethereumProvider && !hasCheckedPersistedSession) {
      getPersistedSession();
    }
  }, [ethereumProvider, _checkForPersistedSession, hasCheckedPersistedSession]);

  const value = useMemo(
    () => ({
      pairings,
      isInitializing,
      accounts,
      chain,
      client,
      session,
      disconnect,
      connect,
      web3Provider,
    }),
    [
      pairings,
      isInitializing,
      accounts,
      chain,
      client,
      session,
      disconnect,
      connect,
      web3Provider,
    ]
  );

  return (
    <WalletConnectContext.Provider
      value={{
        ...value,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
}

export function useWalletConnectClient() {
  const context = useContext(WalletConnectContext);
  if (context === undefined) {
    throw new Error(
      "useWalletConnectClient must be used within a WalletConnectContext"
    );
  }
  return context;
}
