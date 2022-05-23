import React from 'react';
import { useSelector } from 'react-redux';
import { normalizeUserName } from 'helpers/MessageHelper';
import AvatarView from '../AvatarView';
import { utils } from 'ethers';
import './index.scss';
import images from 'common/images';
import toast from 'react-hot-toast';

type TokenItemProps = {
  symbol: string;
  balance: string;
  name: string;
};

const TokenItem = ({ symbol, balance, name }: TokenItemProps) => {
  return (
    <div className="token-item">
      <img
        className="img-symbol"
        alt=""
        src={`https://cryptocurrencyliveprices.com/img/${symbol}-${name}.png`}
      />
      <div className="token-name__wrapper">
        <span className="symbol">{symbol}</span>
        <span className="name">{name}</span>
      </div>
      <div className="balance__wrapper">
        <span className="main">{balance}</span>
        <span className="usd">$1,123.09</span>
      </div>
    </div>
  );
};

type ActionItemProps = {
  label: string;
  icon: any;
  onClick: () => void;
};

const ActionItem = ({ label, icon, onClick }: ActionItemProps) => {
  return (
    <div className="action-item normal-button" onClick={onClick}>
      <img alt="" src={icon} />
      <span className="action-label">{label}</span>
    </div>
  );
};

const SettingBalance = () => {
  const userData = useSelector((state: any) => state.user.userData);
  const address = utils.computeAddress(userData.user_id);
  const onCopy = async () => {
    await navigator.clipboard.writeText(address);
    toast.success('Address was copied.', {
      className: 'Success !',
    });
  };
  const onSendClick = () => {};
  const onReceiveClick = () => {};
  const onSwapClick = () => {};
  return (
    <div className="setting-balance__container">
      <div className="header">
        <div className="user-name__wrapper">
          <AvatarView user={userData} />
          <span className="user-name">
            {normalizeUserName(userData?.user_name)}
          </span>
        </div>
        <div className="address__wrapper normal-button" onClick={onCopy}>
          <span className="address">{normalizeUserName(address)}</span>
          <img src={images.icCopyWhite} alt="" />
        </div>
      </div>
      <span className="balance-main">1.23 ETH</span>
      <span className="balance-usd">3,743.09 USD</span>
      <div className="action-wrapper">
        <ActionItem
          label="Send"
          icon={images.icArrowUp}
          onClick={onSendClick}
        />
        <ActionItem
          label="Receive"
          icon={images.icArrowDown}
          onClick={onReceiveClick}
        />
        <ActionItem label="Swap" icon={images.icSwap} onClick={onSwapClick} />
      </div>
      <div className="token__wrapper">
        <TokenItem symbol="eth" name="ethereum" balance="0.123" />
        <TokenItem symbol="usdt" name="tether" balance="0.123" />
        <TokenItem symbol="dai" name="dai" balance="0.123" />
      </div>
    </div>
  );
};

export default SettingBalance;
