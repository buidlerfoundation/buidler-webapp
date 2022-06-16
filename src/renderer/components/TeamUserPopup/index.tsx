import React, { useState } from 'react';
import { connect } from 'react-redux';
import AppInput from '../AppInput';
import UserItem from './UserItem';
import './index.scss';

type TeamUserPopupProps = {
  teamUserData: Array<any>;
  selected: Array<any>;
  onClick: (user: any) => void;
};

const TeamUserPopup = ({
  teamUserData,
  selected,
  onClick,
}: TeamUserPopupProps) => {
  const [filter, setFilter] = useState('');
  return (
    <div className="team-user-popup__container">
      <div className="team-user__header">
        <AppInput
          style={{ fontWeight: 600 }}
          placeholder="Filter by name"
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div style={{ height: 10 }} />
      {teamUserData
        .filter((u) => u.user_name.toLowerCase().includes(filter.toLowerCase()))
        .map((u) => (
          <UserItem
            key={u.user_id}
            isSelected={selected.find((el) => el.user_id === u.user_id)}
            user={u}
            onClick={() => {
              onClick(u);
            }}
          />
        ))}
      <div style={{ height: 10 }} />
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    teamUserData: state.user.teamUserData,
  };
};

export default connect(mapStateToProps)(TeamUserPopup);
