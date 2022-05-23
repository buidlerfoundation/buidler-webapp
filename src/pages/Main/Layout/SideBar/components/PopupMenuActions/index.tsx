import React from "react";
import { clearData } from "../../../../../../common/Cookie";
import ActionItem from "./ActionItem";
import "./index.scss";
import { useNavigate } from "react-router-dom";

type PopupMenuActionProps = {
  onCreateChannel: () => void;
  onLogout: () => void;
};

const PopupMenuActions = ({
  onCreateChannel,
  onLogout,
}: PopupMenuActionProps) => {
  const navigate = useNavigate();
  return (
    <div className="action-popup__container">
      <ActionItem
        actionName="Logout"
        onPress={() => {
          clearData();
          onLogout();
          navigate("/started", { replace: true });
        }}
      />
    </div>
  );
};

export default PopupMenuActions;
