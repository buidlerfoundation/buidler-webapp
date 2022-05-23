import React, { useEffect, useState } from 'react';
import Modal from '@material-ui/core/Modal';
import './index.scss';
import NormalButton from '../NormalButton';
import AppInput from '../AppInput';

type ModalEditGroupChannelProps = {
  open: boolean;
  handleClose: () => void;
  onEditSpaceChannel: (spaceData: any) => void;
  spaceName: string;
};

const ModalEditGroupChannel = ({
  open,
  handleClose,
  onEditSpaceChannel,
  spaceName,
}: ModalEditGroupChannelProps) => {
  const [spaceData, setSpaceData] = useState({
    name: '',
  });

  useEffect(() => {
    setSpaceData({ name: spaceName });
  }, [spaceName]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="edit-group-channel-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <div className="edit-group-channel-view__container">
          <span className="edit-group-channel__title">Edit space name</span>
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
              title="Save"
              onPress={() => {
                if (!spaceData.name) return;
                onEditSpaceChannel(spaceData);
              }}
              type="main"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditGroupChannel;
