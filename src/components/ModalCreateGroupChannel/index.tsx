import React, { useState } from 'react';
import Modal from '@material-ui/core/Modal';
import './index.scss';
import NormalButton from '../NormalButton';
import AppInput from '../AppInput';

type ModalCreateGroupChannelProps = {
  open: boolean;
  handleClose: () => void;
  onCreateSpaceChannel: (spaceData: any) => void;
};

const ModalCreateGroupChannel = ({
  open,
  handleClose,
  onCreateSpaceChannel,
}: ModalCreateGroupChannelProps) => {
  const [spaceData, setSpaceData] = useState({
    name: '',
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="create-group-channel-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <div className="create-group-channel-view__container">
          <span className="create-group-channel__title">Create space</span>
          <div style={{ height: 95 }} />
          <AppInput
            className="app-input-highlight"
            placeholder="Enter space name"
            onChange={(e) =>
              setSpaceData({ name: e.target.value.toUpperCase() })
            }
            value={spaceData?.name}
            autoFocus
          />
          <div className="group-channel__bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title="Create space"
              onPress={() => {
                if (!spaceData.name) return;
                onCreateSpaceChannel(spaceData);
              }}
              type="main"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreateGroupChannel;
