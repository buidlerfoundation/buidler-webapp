import React from 'react';
import images from 'renderer/common/images';
import { SpaceCollectionData } from 'renderer/models';
import './index.scss';

type ConditionItemProps = {
  item: SpaceCollectionData;
};

const ConditionItem = ({ item }: ConditionItemProps) => {
  return (
    <div className="condition-item__container">
      <div className="condition-nft__wrap">
        <img
          src={item.nft_collection.image_url || images.icImageDefault}
          className="collection-logo"
          alt=""
        />
        <span className="collection-name text-ellipsis">
          {item.amount < 10 ? `0${item.amount}` : item.amount}{' '}
          {item.nft_collection.name}
        </span>
        <div style={{ flex: 1 }} />
        <a
          className="button-get normal-button"
          href={`https://opensea.io/collection/${item.nft_collection.name
            .replace(' ', '')
            .toLowerCase()}`}
          target="_blank"
          rel="noreferrer"
        >
          <span>Get</span>
        </a>
      </div>
      <span className="condition-description">
        You need to meet the above requirement to have access to the space
      </span>
    </div>
  );
};

export default ConditionItem;
