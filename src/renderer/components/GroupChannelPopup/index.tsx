import React, { useCallback } from "react";
import { Space } from "renderer/models";
import "./index.scss";

type SelectSpaceItemProps = {
  space: any;
  onClick: (space: any) => void;
};

const SelectSpaceItem = ({ space, onClick }: SelectSpaceItemProps) => {
  const handleSelectSpace = useCallback(() => {
    onClick(space);
  }, [onClick, space]);
  return (
    <div className="group-item normal-button" onClick={handleSelectSpace}>
      <span>{space?.space_name}</span>
    </div>
  );
};

type GroupChannelPopupProps = {
  space: Array<Space>;
  onSelect: (item: Space) => void;
};

const GroupChannelPopup = ({ space, onSelect }: GroupChannelPopupProps) => {
  const handleSelectSpace = useCallback(
    (item: Space) => onSelect(item),
    [onSelect]
  );
  const renderSpaceItem = useCallback(
    (item: Space) => (
      <SelectSpaceItem
        space={item}
        key={item?.space_id}
        onClick={handleSelectSpace}
      />
    ),
    [handleSelectSpace]
  );
  return (
    <div className="channel-popup__container">{space.map(renderSpaceItem)}</div>
  );
};

export default GroupChannelPopup;
