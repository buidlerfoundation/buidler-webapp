import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';

class WalletConnectUtils {
  connector: any = null;

  init(onDisconnect: () => void) {
    this.connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
      qrcodeModal: QRCodeModal,
    });
    if (this.connector.connected) {
      this.connector.on('disconnect', onDisconnect);
    }
  }

  connect(onConnect: () => void, onDisconnect: () => void) {
    this.connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
      qrcodeModal: QRCodeModal,
    });
    this.connector.on('disconnect', onDisconnect);
    this.connector.on('connect', onConnect);
    if (!this.connector.connected) {
      // create new session
      this.connector.createSession();
    }
  }

  disconnect() {
    if (this.connector.connected) {
      this.connector.killSession();
    }
  }
}

export default new WalletConnectUtils();
