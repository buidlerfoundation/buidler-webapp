import React, { useCallback } from 'react';
import { GroupSettingItem, SettingItem } from 'renderer/models';
import SettingTitle from './SettingTitle';

type GroupSettingTitleProps = {
  group: GroupSettingItem;
  onItemClick: (id: string) => void;
  currentPageId: string;
};

const GroupSettingTitle = ({
  group,
  onItemClick,
  currentPageId,
}: GroupSettingTitleProps) => {
  const renderItem = useCallback(
    (el: SettingItem) => {
      const isActive = currentPageId === el.id;
      return (
        <SettingTitle
          key={el.label}
          item={el}
          isActive={isActive}
          onItemClick={onItemClick}
        />
      );
    },
    [currentPageId, onItemClick]
  );
  return (
    <div key={group.id}>
      <div className="group-setting-title" style={{ marginTop: 10 }}>
        <span>{group.groupLabel}</span>
      </div>
      {group.items.map(renderItem)}
    </div>
  );
};

export default GroupSettingTitle;
