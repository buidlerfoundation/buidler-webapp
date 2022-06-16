import { Modal } from '@material-ui/core';
import React from 'react';

type ModalSettingProps = {
  open: boolean;
  handleClose: () => void;
  children: React.ReactElement;
};

const ModalSetting = ({ open, handleClose, children }: ModalSettingProps) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="setting-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      {children}
    </Modal>
  );
};

export default ModalSetting;
