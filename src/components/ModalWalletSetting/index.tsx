import { Modal } from "@material-ui/core";
import React, { useState } from "react";
import images from "common/images";
import "./index.scss";
import SettingBalance from "./SettingBalance";

type ModalWalletSettingProps = {
  open: boolean;
  handleClose: () => void;
};

const ModalWalletSetting = ({ open, handleClose }: ModalWalletSettingProps) => {
  const settings = [
    {
      label: "Balance",
      icon: images.icSettingWalletBalance,
      id: "1",
      badge: null,
    },
    {
      label: "Transaction",
      icon: images.icSettingWalletTransaction,
      id: "2",
    },
    {
      label: "NFTs",
      icon: images.icSettingWalletNFT,
      id: "3",
    },
    {
      label: "Settings",
      icon: images.icCommunitySetting,
      id: "4",
    },
  ];
  const [currentPageId, setCurrentPageId] = useState(settings[0].id);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="wallet-setting-modal"
      style={{ backgroundColor: "var(--color-backdrop)" }}
    >
      <div className="wallet-setting__container">
        <div className="left-side">
          <div className="group-setting-title" style={{ marginTop: 10 }}>
            <span>WALLET</span>
          </div>
          {settings.map((el) => {
            const isActive = currentPageId === el.id;
            return (
              <div
                className={`setting-item ${isActive && "active"}`}
                key={el.label}
                onClick={() => setCurrentPageId(el.id)}
              >
                <img alt="" src={el.icon} />
                <span className="setting-label">{el.label}</span>
                {el.badge && <div className="badge-backup mr10" />}
              </div>
            );
          })}
        </div>
        <div className="body">
          {currentPageId === "1" && <SettingBalance />}
        </div>
      </div>
    </Modal>
  );
};

export default ModalWalletSetting;
