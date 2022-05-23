import React, { useCallback, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import images from '../../common/images';
import GroupTitle from '../../pages/Main/Layout/SideBar/components/GroupTitle';
import AppInput from '../AppInput';
import './index.scss';

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
  const [search, setSearch] = useState('');
  const channels = useMemo(() => {
    if (!search) return channel;
    return channel.filter((el: any) =>
      el.channel_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, channel]);
  return (
    <div className="popup-channel__container hide-scroll-bar">
      <AppInput
        placeholder="Search channel"
        className="search-channel"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {space.map((g, index) => {
        return (
          <div key={g?.space_id} style={{ marginTop: index === 0 ? 60 : 0 }}>
            <GroupTitle title={g?.space_name} />
            {channels
              ?.filter((c: any) => c.space_id === g?.space_id)
              ?.map?.((c: any) => {
                const isActive = selected?.find(
                  (el) => el.channel_id === c.channel_id
                );
                return (
                  <div
                    key={c.channel_id}
                    className="channel-item normal-button"
                    onClick={() => {
                      if (isActive) {
                        onChange(
                          selected.filter(
                            (el) => el.channel_id !== c.channel_id
                          )
                        );
                      } else {
                        onChange([...selected, c]);
                      }
                    }}
                  >
                    <span className="channel-name">
                      {c.channel_type === 'Private' ? (
                        <img src={images.icPrivate} alt="" />
                      ) : (
                        '#'
                      )}{' '}
                      {c.channel_name}
                    </span>
                    {isActive && <img alt="" src={images.icCheck} />}
                  </div>
                );
              })}
          </div>
        );
      })}
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
