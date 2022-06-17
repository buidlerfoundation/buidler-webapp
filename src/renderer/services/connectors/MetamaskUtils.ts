class MetamaskUtils {
  connected = false;
  init(
    onDisconnect: () => void,
    onUpdate: (data: any) => void,
    onConnected: () => void
  ) {
    if (window.ethereum?.isConnected()) {
      onConnected();
      this.metamaskListener(onDisconnect, onUpdate);
    } else {
      window.ethereum?.on("connect", () => {
        onConnected();
        this.metamaskListener(onDisconnect, onUpdate);
      });
    }
  }

  metamaskListener(onDisconnect: () => void, onUpdate: (data: any) => void) {
    window.ethereum?.on("disconnect", onDisconnect);
    window.ethereum?.on("accountsChanged", onUpdate);
    window.ethereum?.on("chainChanged", onUpdate);
  }
}

export default new MetamaskUtils();
