import React, { useState } from 'react';
import { connect } from 'react-redux';
import AppInput from '../AppInput';
import AssignItem from './AssignItem';
import './index.scss';

type AssignPopupProps = {
  teamUserData: Array<any>;
  selected: any;
  onChanged: (user: any) => void;
};

const AssignPopup = ({
  teamUserData,
  selected,
  onChanged,
}: AssignPopupProps) => {
  const [filter, setFilter] = useState('');
  return (
    <div className="assign-popup__container">
      <div className="assign__header">
        <AppInput
          style={{ fontWeight: 600 }}
          placeholder="Assign to..."
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div style={{ height: 10 }} />
      <AssignItem
        isSelected={false}
        user={{ user_id: '', user_name: 'Unassigned' }}
        onClick={() => onChanged(null)}
      />
      {teamUserData
        .filter((u) => u.user_name.toLowerCase().includes(filter.toLowerCase()))
        .map((u) => (
          <AssignItem
            key={u.user_id}
            isSelected={u.user_id === selected?.user_id}
            user={u}
            onClick={() => {
              onChanged(u.user_id === selected?.user_id ? null : u);
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

export default connect(mapStateToProps)(AssignPopup);
