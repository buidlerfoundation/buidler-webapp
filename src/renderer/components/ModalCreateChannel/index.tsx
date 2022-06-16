import React, { useCallback, useEffect, useState } from "react";
import Modal from "@material-ui/core/Modal";
import "./index.scss";
import CreateChannelView from "./CreateChannelView";

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
    name: "",
    space: null,
    isPrivate: false,
    members: [],
  });
  useEffect(() => {
    setChannelData({
      name: "",
      space: initialSpace,
      isPrivate: false,
      members: [],
    });
  }, [initialSpace, open]);
  const handleCreateChannel = useCallback(() => {
    if (channelData.space == null) {
      // show error
      return;
    }
    onCreateChannel(channelData);
  }, [channelData, onCreateChannel]);
  const handleUpdateData = useCallback((key: string, val: any) => {
    setChannelData((data: any) => ({ ...data, [key]: val }));
  }, []);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="create-channel-modal"
      style={{ backgroundColor: "var(--color-backdrop)" }}
    >
      <div style={{ display: "table" }}>
        <CreateChannelView
          space={space}
          onCancel={handleClose}
          onCreate={handleCreateChannel}
          channelData={channelData}
          update={handleUpdateData}
        />
      </div>
    </Modal>
  );
};

export default ModalCreateChannel;
