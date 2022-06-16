class MetamaskUtils {
  connected = false;
  init(onDisconnect: () => void, onUpdate: (data: any) => void) {
    if (window.ethereum?.isConnected()) {
      window.ethereum?.on("disconnect", onDisconnect);
      window.ethereum?.on("accountsChanged", onUpdate);
      window.ethereum?.on("chainChanged", onUpdate);
    }
  }
}

export default new MetamaskUtils();
