import React, { useCallback } from 'react';
import images from 'renderer/common/images';
import ReactTooltip from 'react-tooltip';
import '../index.scss';

type TokenItemProps = {
  imageUrl: string;
  name: string;
  address: string;
  onClick: (address: string) => void;
};

const TokenItem = ({ imageUrl, name, address, onClick }: TokenItemProps) => {
  const handleClick = useCallback(() => onClick(address), [address, onClick]);
  return (
    <div
      className="token-container"
      onClick={handleClick}
      data-for="token-name"
      data-tip={name}
    >
      <img
        className="token-icon"
        src={imageUrl || images.icImageDefault}
        alt=""
      />
      <ReactTooltip
        type="dark"
        effect="solid"
        id="token-name"
        className="token-tooltip"
      />
    </div>
  );
};

export default TokenItem;
