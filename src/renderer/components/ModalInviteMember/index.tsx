import React, { useCallback, useEffect, useState } from "react";
import Modal from "@material-ui/core/Modal";
import "./index.scss";
import images from "renderer/common/images";
import toast from "react-hot-toast";
import api from "renderer/api";
import { useSelector } from "react-redux";
import NormalButton from "../NormalButton";

type ModalInviteMemberProps = {
  open: boolean;
  handleClose: () => void;
};

const ModalInviteMember = ({ open, handleClose }: ModalInviteMemberProps) => {
  const [inviteLink, setInviteLink] = useState("");
  const currentTeam = useSelector((state: any) => state.user.currentTeam);
  const getLink = useCallback(async () => {
    const res = await api.invitation(currentTeam.team_id);
    const link = res.data?.invitation_url || "";
    setInviteLink(link);
  }, [currentTeam]);
  useEffect(() => {
    if (open) {
      getLink();
    }
  }, [open, getLink]);
  const onCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link was copied.", {
      className: "Success !",
    });
  }, [inviteLink]);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="invite-member-modal"
      style={{ backgroundColor: "var(--color-backdrop)" }}
    >
      <div style={{ display: "table" }}>
        <div className="invite-member-view__container">
          <span className="invite-member__title">Invite members</span>
          <div style={{ height: 86 }} />
          <div className="server-link__wrapper">
            <div className="tag-link">
              <img src={images.icLink} alt="" />
            </div>
            <span className="invite-link enable-user-select">{inviteLink}</span>
            <div className="btn-copy normal-button" onClick={onCopyLink}>
              <img
                src={images.icCopy}
                alt=""
                style={{ filter: "brightness(2)" }}
              />
            </div>
          </div>
          <div className="invite-member__bottom">
            <NormalButton title="Done" onPress={handleClose} type="primary" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalInviteMember;
