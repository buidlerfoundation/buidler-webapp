import React, { useState } from 'react';
import { Modal } from '@material-ui/core';
import './index.scss';
import NormalButton from '../NormalButton';
import AppInput from '../AppInput';
import { getCookie, setCookie } from 'renderer/common/Cookie';
import { AsyncKey } from 'renderer/common/AppConfig';
import toast from 'react-hot-toast';
import { decryptString, encryptString, getIV } from 'renderer/utils/DataCrypto';

type ModalChangePasswordProps = {
  open: boolean;
  handleClose: () => void;
};

const ModalChangePassword = ({
  open,
  handleClose,
}: ModalChangePasswordProps) => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const togglePassword = () => setShowPassword(!showPassword);
  const onSave = async () => {
    try {
      let seed: any = null;
      const iv = await getIV();
      const encryptedStr: any = await getCookie(AsyncKey.encryptedDataKey);
      const encryptedSeed: any = await getCookie(AsyncKey.encryptedSeedKey);
      if (Object.keys(encryptedSeed || {}).length > 0) {
        seed = decryptString(encryptedSeed, password, iv);
      }
      const decryptedStr = decryptString(encryptedStr, password, iv);
      if (!decryptedStr) {
        toast.error('Invalid Password');
      } else {
        const encryptedData = encryptString(decryptedStr, newPassword, iv);
        setCookie(AsyncKey.encryptedDataKey, encryptedData);
        if (seed) {
          const encryptedSeedData = encryptString(seed, newPassword, iv);
          setCookie(AsyncKey.encryptedSeedKey, encryptedSeedData);
        }
        toast.success('Password changed!');
        handleClose();
      }
    } catch (error) {
      toast.error('Invalid Password');
    }
  };
  const onChangeText = (e: any) => {
    setPassword(e.target.value);
  };
  const onNewPassChange = (e: any) => {
    setNewPassword(e.target.value);
  };
  return (
    <Modal
      open={open}
      className="change-password-modal"
      onClose={handleClose}
      BackdropProps={{
        style: {
          backgroundColor: 'var(--color-backdrop)',
        },
      }}
    >
      <div style={{ display: 'table' }}>
        <div className="modal__container">
          <div className="modal-state__container">
            <span className="title">Change password</span>
            <div className="input-password__wrapper">
              <AppInput
                className="app-input-highlight"
                placeholder="Current password"
                type={showPassword ? 'text' : 'password'}
                style={{ paddingRight: 80, width: 'calc(100% - 100px)' }}
                value={password}
                onChange={onChangeText}
              />
              <div
                className="toggle-password normal-button"
                onClick={togglePassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </div>
            </div>
            <div className="input-new-password__wrapper">
              <AppInput
                className="app-input-highlight"
                placeholder="New password"
                type="password"
                style={{ paddingRight: 80, width: 'calc(100% - 100px)' }}
                value={newPassword}
                onChange={onNewPassChange}
              />
            </div>
          </div>
          <div className="password__bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton title="Save" onPress={onSave} type="main" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalChangePassword;
