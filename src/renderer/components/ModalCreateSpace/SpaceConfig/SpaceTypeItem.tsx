import React, { useCallback } from "react";
import { SpaceType } from "renderer/models";
import "../index.scss";

type SpaceTypeItemProps = {
  item: SpaceType;
  onClick: (item: SpaceType) => void;
  isActive: boolean;
};

const SpaceTypeItem = ({ item, onClick, isActive }: SpaceTypeItemProps) => {
  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);
  return (
    <div
      className={`space-type ${isActive ? "active" : ""}`}
      onClick={handleClick}
    >
      <span>{item}</span>
    </div>
  );
};

export default SpaceTypeItem;
