import { Modal } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "renderer/api";
import { CreateSpaceData, UserNFTCollection } from "renderer/models";
import NormalButton from "../NormalButton";
import "./index.scss";
import SpaceConfig from "./SpaceConfig";
import SpaceIcon from "./SpaceIcon";
import SpaceInformation from "./SpaceInformation";

type ModalCreateSpaceProps = {
  open: boolean;
  handleClose: () => void;
  onCreateSpace: (spaceData: CreateSpaceData) => void;
};

const ModalCreateSpace = ({
  open,
  handleClose,
  onCreateSpace,
}: ModalCreateSpaceProps) => {
  const [modalState, setModalState] = useState<"Information" | "Config">(
    "Information"
  );
  const [nftCollections, setNFTCollections] = useState<
    Array<UserNFTCollection>
  >([]);
  const [spaceData, setSpaceData] = useState<CreateSpaceData>({
    name: "",
    description: "",
    spaceType: "Exclusive",
  });
  const fetchNFTCollections = useCallback(async () => {
    const res = await api.getNFTCollection();
    setNFTCollections(res?.data || []);
  }, []);
  useEffect(() => {
    if (open) {
      setSpaceData({
        name: "",
        description: "",
        spaceType: "Exclusive",
      });
      setModalState("Information");
      fetchNFTCollections();
    }
  }, [open, fetchNFTCollections]);
  const onSecondaryPress = useCallback(() => {
    if (modalState === "Config") {
      setModalState("Information");
    } else {
      handleClose();
    }
  }, [handleClose, modalState]);
  const onPrimaryPress = useCallback(() => {
    if (modalState === "Information") {
      if (!spaceData.name) {
        toast.error("Space name can not be empty");
        return;
      }
      setModalState("Config");
    } else {
      onCreateSpace(spaceData);
    }
  }, [modalState, onCreateSpace, spaceData]);
  return (
    <Modal open={open} onClose={handleClose} className="modal-container">
      <div className="create-space__container">
        <div className="label__wrap">
          {modalState === "Information" ? (
            <span className="label">Create Space</span>
          ) : (
            <>
              <SpaceIcon spaceData={spaceData} emojiSize={30} />
              <span className="label">{spaceData.name}</span>
            </>
          )}
        </div>
        {modalState === "Information" && (
          <SpaceInformation spaceData={spaceData} setSpaceData={setSpaceData} />
        )}
        {modalState === "Config" && (
          <SpaceConfig
            spaceData={spaceData}
            setSpaceData={setSpaceData}
            nftCollections={nftCollections}
          />
        )}
        <div className="create-space__footer">
          <NormalButton
            title={modalState === "Information" ? "Cancel" : "Back"}
            type="normal"
            onPress={onSecondaryPress}
          />
          <NormalButton
            title={modalState === "Information" ? "Next" : "Create"}
            type="main"
            onPress={onPrimaryPress}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreateSpace;
