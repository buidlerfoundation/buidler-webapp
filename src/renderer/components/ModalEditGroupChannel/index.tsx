import React, { useCallback, useEffect, useState } from "react";
import Modal from "@material-ui/core/Modal";
import "./index.scss";
import NormalButton from "../NormalButton";
import AppInput from "../AppInput";

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
    name: "",
  });

  useEffect(() => {
    setSpaceData({ name: spaceName });
  }, [spaceName, open]);
  const handleUpdateSpaceName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSpaceData({ name: e.target.value.toUpperCase() }),
    []
  );
  const handleEditSpace = useCallback(() => {
    if (!spaceData.name) return;
    onEditSpaceChannel(spaceData);
  }, [onEditSpaceChannel, spaceData]);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="edit-group-channel-modal"
      style={{ backgroundColor: "var(--color-backdrop)" }}
    >
      <div style={{ display: "table" }}>
        <div className="edit-group-channel-view__container">
          <span className="edit-group-channel__title">Edit space name</span>
          <div style={{ height: 95 }} />
          <AppInput
            className="app-input-highlight"
            placeholder="Enter space name"
            onChange={handleUpdateSpaceName}
            value={spaceData?.name}
            autoFocus
          />
          <div className="group-channel__bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton title="Save" onPress={handleEditSpace} type="main" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditGroupChannel;
