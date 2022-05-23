import React, { useEffect, useState } from 'react';
import Modal from '@material-ui/core/Modal';
import './index.scss';
import CreateChannelView from './CreateChannelView';

type ModalCreateChannelProps = {
  open: boolean;
  handleClose: () => void;
  onCreateChannel: (channelData: any) => void;
  space: Array<any>;
  initialSpace?: any;
};

const ModalCreateChannel = ({
  open,
  handleClose,
  onCreateChannel,
  space,
  initialSpace,
}: ModalCreateChannelProps) => {
  const [channelData, setChannelData] = useState<any>({
    name: '',
    space: null,
    isPrivate: false,
    members: [],
  });
  useEffect(() => {
    setChannelData((data: any) => ({ ...data, space: initialSpace }));
  }, [initialSpace]);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="create-channel-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <CreateChannelView
          space={space}
          onCancel={handleClose}
          onCreate={() => {
            if (channelData.space == null) {
              // show error
              return;
            }
            onCreateChannel(channelData);
          }}
          channelData={channelData}
          update={(key, val) => {
            setChannelData((data: any) => ({ ...data, [key]: val }));
          }}
        />
      </div>
    </Modal>
  );
};

export default ModalCreateChannel;
