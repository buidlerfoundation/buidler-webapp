import React, { useEffect, useState } from 'react';
import { Modal } from '@material-ui/core';
import './index.scss';
import images from '../../common/images';
import UpdateUserProfile from './UpdateUserProfile';
import UpdateNotification from './UpdateNotification';
import UpdateDefaultChannel from './UpdateDefaultChannel';
import api from 'api';
import NormalButton from '../NormalButton';
import SettingWallet from './SettingWallet';
import { useSelector } from 'react-redux';
import SettingSecurity from './SettingSecurity';
import ModalConfirmDelete from '../ModalConfirmDelete';
import GlobalVariable from 'services/GlobalVariable';

type ModalUserSettingProps = {
  open: boolean;
  handleClose: () => void;
  user?: any;
  currentChannel?: any;
  updateUserChannel?: (channels: Array<any>) => any;
  channels?: Array<any>;
  onLogout: () => void;
  updateUser?: (userData: any) => any;
  onBackupPress: () => void;
};

const ModalUserSetting = ({
  open,
  user,
  handleClose,
  currentChannel,
  updateUserChannel,
  channels,
  onLogout,
  updateUser,
  onBackupPress,
}: ModalUserSettingProps) => {
  const seed = useSelector((state: any) => state.configs.seed);
  const [isOpenConfirmLogout, setOpenConfirmLogout] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    avatarUrl: user?.avatar_url,
    userName: user?.user_name,
    ensAsset: null,
    nftAsset: null,
  });
  const [collectibleData, setCollectibleData] = useState({ ens: [], nft: [] });
  const fetchData = async () => {
    const res = await api.getCollectibles();
    if (res.statusCode === 200) {
      setCollectibleData({
        ens: res.ens_assets,
        nft: res.nft_assets.filter((el: any) => el.is_active),
      });
    }
  };
  useEffect(() => {
    if (open) {
      fetchData();
      setUserData({
        avatarUrl: user?.avatar_url,
        userName: user?.user_name,
        ensAsset: user?.is_verified_username ? user?.user_name : null,
        nftAsset: null,
      });
    }
  }, [user, open]);
  const settings = [
    {
      label: 'User profile',
      icon: images.icUserCircle,
      id: '1',
    },
    {
      label: 'Notification',
      icon: images.icSettingChannelNotification,
      id: '2',
    },
    {
      label: 'Wallet',
      icon: images.icSettingWallet,
      id: '3',
      badge: !!seed,
    },
    // {
    //   label: 'Default channel',
    //   icon: images.icUserSettingDefaultChannelWhite,
    //   id: '4',
    // },
    {
      label: 'Security',
      icon: images.icSettingSecure,
      id: '5',
    },
  ];
  const [currentPageId, setCurrentPageId] = useState(settings[0].id);
  const onSave = async () => {
    if (uploading) return;
    setLoading(true);
    await updateUser?.(userData);
    setLoading(false);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="user-setting-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div className="user-setting__container">
        <div className="left-side">
          <div className="group-setting-title" style={{ marginTop: 10 }}>
            <span>GENERAL</span>
          </div>
          {settings.map((el) => {
            const isActive = currentPageId === el.id;
            return (
              <div
                className={`setting-item ${isActive && 'active'}`}
                key={el.label}
                onClick={() => setCurrentPageId(el.id)}
              >
                <img alt="" src={el.icon} />
                <span className="setting-label">{el.label}</span>
                {el.badge && <div className="badge-backup mr10" />}
              </div>
            );
          })}
          <div
            className="log-out__wrapper"
            onClick={() => setOpenConfirmLogout(true)}
          >
            <img alt="" src={images.icLeaveTeam} />
            <span className="log-out-text">Logout</span>
          </div>
          <div className="app-version">
            <span>{GlobalVariable.version}</span>
          </div>
        </div>
        <div className="body">
          {currentPageId === '1' && (
            <UpdateUserProfile
              setUploading={setUploading}
              collectibleData={collectibleData}
              userData={userData}
              user={user}
              onUpdateAvatar={(url) =>
                setUserData({ ...userData, avatarUrl: url || user?.avatar_url })
              }
              onUpdateENS={(ens) => setUserData({ ...userData, ensAsset: ens })}
              onUpdateNFT={(nft) => setUserData({ ...userData, nftAsset: nft })}
              onUpdateUserName={(name) =>
                setUserData({ ...userData, userName: name })
              }
            />
          )}
          {currentPageId === '2' && <UpdateNotification />}
          {currentPageId === '3' && (
            <SettingWallet onBackupPress={onBackupPress} />
          )}
          {currentPageId === '4' && (
            <UpdateDefaultChannel
              user={user}
              channels={channels}
              currentChannel={currentChannel}
              updateUserChannel={updateUserChannel}
            />
          )}
          {currentPageId === '5' && <SettingSecurity />}
          <div style={{ flex: 1 }} />
          <div className="bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title="Save"
              onPress={onSave}
              type="main"
              loading={loading}
            />
          </div>
        </div>
        <ModalConfirmDelete
          open={isOpenConfirmLogout}
          handleClose={() => setOpenConfirmLogout(false)}
          title="Logout"
          description="Buidler will automatically remove all your data from this account if you log out. Are you sure you want to log out?"
          onDelete={onLogout}
          contentDelete="Logout"
        />
      </div>
    </Modal>
  );
};

export default ModalUserSetting;
