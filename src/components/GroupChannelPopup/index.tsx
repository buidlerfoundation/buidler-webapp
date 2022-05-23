import React from 'react';
import './index.scss';

type GroupChannelPopupProps = {
  space: Array<any>;
  onSelect: (item: any) => void;
};

const GroupChannelPopup = ({ space, onSelect }: GroupChannelPopupProps) => {
  return (
    <div className="channel-popup__container">
      {space.map((g) => (
        <div
          key={g?.space_id}
          className="group-item normal-button"
          onClick={() => onSelect(g)}
        >
          <span>{g?.space_name}</span>
        </div>
      ))}
    </div>
  );
};

export default GroupChannelPopup;
