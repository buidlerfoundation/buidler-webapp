import { utils } from 'ethers';
import React from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import images from 'renderer/common/images';

type SettingWalletProps = {
  onBackupPress: () => void;
};

const SettingWallet = ({ onBackupPress }: SettingWalletProps) => {
  const user = useSelector((state: any) => state.user.userData);
  const seed = useSelector((state: any) => state.configs.seed);
  const address = utils.computeAddress(user.user_id);
  const onCopy = async () => {
    await navigator.clipboard.writeText(address);
    toast.success('Address was copied.', {
      className: 'Success !',
    });
  };
  return (
    <div>
      <span className="modal-label">Wallet</span>
      <div className="address-view">
        <div className="icon-view">
          <img src={images.icEth} alt="" />
        </div>
        <span className="address">{address}</span>
        <div className="btn-copy" onClick={onCopy}>
          <img src={images.icCopy} alt="" style={{ filter: 'brightness(2)' }} />
        </div>
      </div>
      {seed && (
        <div className="btn-backup" onClick={onBackupPress}>
          <span className="backup-text">Backup seed phrase</span>
          <div className="badge-backup ml15" />
          <div style={{ flex: 1 }} />
          <img src={images.icChevronRight} alt="" />
        </div>
      )}
    </div>
  );
};

export default SettingWallet;
