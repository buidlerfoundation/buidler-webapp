import React from 'react';
import ImageHelper from '../../../../common/ImageHelper';
import images from '../../../../common/images';
import './index.scss';

type TeamViewProps = {
  team: Array<any>;
  currentTeam: any;
  onChangeTeam: (team: any) => void;
};

const TeamView = ({ team, currentTeam, onChangeTeam }: TeamViewProps) => {
  return (
    <div id="team-view">
      {team?.map?.((t) => {
        const isSelected = t.team_id === currentTeam.team_id;
        const logo = currentTeam?.team_icon
          ? ImageHelper.normalizeImage(t?.team_icon, t?.team_id, {
              w: 50,
              h: 50,
              radius: 10,
            })
          : images.icTeamDefault;
        return (
          <div
            className={`team-item normal-button ${
              isSelected ? 'team-selected' : ''
            }`}
            key={t.team_id}
            onClick={() => onChangeTeam(t)}
          >
            <img alt="" className="team-icon" src={logo} />
          </div>
        );
      })}
    </div>
  );
};

export default TeamView;
