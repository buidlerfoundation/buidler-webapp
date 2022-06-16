import React, { useCallback } from 'react';
import { SettingItem } from 'renderer/models';

type SettingTitleProps = {
  item: SettingItem;
  isActive: boolean;
  onItemClick: (id: string) => void;
};

const SettingTitle = ({ item, isActive, onItemClick }: SettingTitleProps) => {
  const handleItemClick = useCallback(
    () => onItemClick(item.id),
    [item.id, onItemClick]
  );
  return (
    <div
      className={`setting-item ${isActive && 'active'}`}
      onClick={handleItemClick}
    >
      <img alt="" src={item.icon} />
      <span className="setting-label">{item.label}</span>
      {/* {el.badge && <div className="badge-backup mr10" />} */}
    </div>
  );
};

export default SettingTitle;
