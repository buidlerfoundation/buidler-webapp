import React, { useCallback, useMemo, useState } from "react";
import { connect } from "react-redux";
import images from "../../common/images";
import GroupTitle from "../../pages/Main/Layout/SideBar/components/GroupTitle";
import AppInput from "../AppInput";
import "./index.scss";

type PopupChannelItemProps = {
  item: any;
  onClick: (item: any, isActive: boolean) => void;
  isActive: boolean;
};

const PopupChannelItem = ({
  item,
  onClick,
  isActive,
}: PopupChannelItemProps) => {
  const handleClick = useCallback(
    () => onClick(item, isActive),
    [item, isActive, onClick]
  );
  return (
    <div className="channel-item normal-button" onClick={handleClick}>
      <span className="channel-name">
        {item.channel_type === "Private" ? (
          <img src={images.icPrivate} alt="" />
        ) : (
          "#"
        )}{" "}
        {item.channel_name}
      </span>
      {isActive && <img alt="" src={images.icCheck} />}
    </div>
  );
};

type PopupChannelProps = {
  channel: Array<any>;
  selected: Array<any>;
  onChange: (data: Array<any>) => void;
  space: Array<any>;
};

const PopupChannel = ({
  channel,
  selected,
  onChange,
  space,
}: PopupChannelProps) => {
  const [search, setSearch] = useState("");
  const channels = useMemo(() => {
    if (!search) return channel;
    return channel.filter((el: any) =>
      el.channel_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, channel]);
  const handleFilter = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  );
  const handleChannelClick = useCallback(
    (item: any, isActive: boolean) => {
      if (isActive) {
        onChange(selected.filter((el) => el.channel_id !== item.channel_id));
      } else {
        onChange([...selected, item]);
      }
    },
    [onChange, selected]
  );
  const filterChannel = useCallback(
    (s: any) => {
      return channels.filter((c) => c.space_id === s.space_id);
    },
    [channels]
  );
  const renderChannel = useCallback(
    (c: any) => {
      const isActive = selected?.find((el) => el.channel_id === c.channel_id);
      return (
        <PopupChannelItem
          item={c}
          isActive={isActive}
          onClick={handleChannelClick}
          key={c.channel_id}
        />
      );
    },
    [handleChannelClick, selected]
  );
  const renderSpace = useCallback(
    (s: any, index: number) => {
      return (
        <div key={s?.space_id} style={{ marginTop: index === 0 ? 60 : 0 }}>
          <GroupTitle title={s?.space_name} />
          {filterChannel(s)?.map?.(renderChannel)}
        </div>
      );
    },
    [filterChannel, renderChannel]
  );
  return (
    <div className="popup-channel__container hide-scroll-bar">
      <AppInput
        placeholder="Search channel"
        className="search-channel"
        value={search}
        onChange={handleFilter}
      />
      {space.map(renderSpace)}
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    channel: state.user.channel,
    space: state.user.spaceChannel,
  };
};

export default connect(mapStateToProps)(PopupChannel);
