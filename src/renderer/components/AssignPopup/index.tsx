import React, { useCallback, useState } from "react";
import { connect } from "react-redux";
import { UserData } from "renderer/models";
import AppInput from "../AppInput";
import AssignItem from "./AssignItem";
import "./index.scss";

type AssignPopupProps = {
  teamUserData: Array<UserData>;
  selected: any;
  onChanged: (user: any) => void;
};

const AssignPopup = ({
  teamUserData,
  selected,
  onChanged,
}: AssignPopupProps) => {
  const [filter, setFilter] = useState("");
  const handleFilter = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value),
    []
  );
  const handleSelectAssignee = useCallback(
    (user: UserData) => {
      onChanged(
        !user.user_id || user.user_id === selected?.user_id ? null : user
      );
    },
    [onChanged, selected?.user_id]
  );
  const filterTeamUser = useCallback(
    (u: UserData) => u.user_name.toLowerCase().includes(filter.toLowerCase()),
    [filter]
  );
  const renderTeamUser = useCallback(
    (u: UserData) => (
      <AssignItem
        key={u.user_id}
        isSelected={u.user_id === selected?.user_id}
        user={u}
        onClick={handleSelectAssignee}
      />
    ),
    [handleSelectAssignee, selected?.user_id]
  );
  return (
    <div className="assign-popup__container">
      <div className="assign__header">
        <AppInput
          style={{ fontWeight: 600 }}
          placeholder="Assign to..."
          onChange={handleFilter}
        />
      </div>
      <div style={{ height: 10 }} />
      <AssignItem
        isSelected={false}
        user={{ user_id: "", user_name: "Unassigned" }}
        onClick={handleSelectAssignee}
      />
      {teamUserData.filter(filterTeamUser).map(renderTeamUser)}
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
