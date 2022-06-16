import React, { useCallback } from "react";
import { ProgressStatus } from "../../common/AppConfig";
import "./index.scss";

type StatusItemProps = {
  item: any;
  onClick: (item: any) => void;
};

const StatusItem = ({ item, onClick }: StatusItemProps) => {
  const handleClick = useCallback(() => onClick(item), [item, onClick]);
  return (
    <div className="status-selection__item normal-button" onClick={handleClick}>
      <img alt="" src={item.icon} />
      <span style={{ marginLeft: 15 }} className={`status__name ${item.type}`}>
        {item.title}
      </span>
    </div>
  );
};

type StatusSelectionPopupProps = {
  onSelectedStatus: (status: any) => void;
  data?: Array<any>;
};

const StatusSelectionPopup = ({
  onSelectedStatus,
  data,
}: StatusSelectionPopupProps) => {
  const handleClick = useCallback(
    (st: any) => onSelectedStatus(st),
    [onSelectedStatus]
  );
  const renderStatusItem = useCallback(
    (st) => <StatusItem key={st.title} item={st} onClick={handleClick} />,
    [handleClick]
  );
  return (
    <div className="status-selection-popup__container">
      <div style={{ height: 10 }} />
      {(data || ProgressStatus).map(renderStatusItem)}
      <div style={{ height: 10 }} />
    </div>
  );
};

export default StatusSelectionPopup;
