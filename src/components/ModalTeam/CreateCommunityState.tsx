import { CircularProgress } from '@material-ui/core';
import React from 'react';
import images from 'common/images';
import AppInput from '../AppInput';
import NormalButton from '../NormalButton';

type CreateCommunityStateProps = {
  onAvatarPress: () => void;
  file?: any;
  onChangeTeamName: (e: any) => void;
  teamName?: string;
  onPaste: (e: any) => void;
  onCreatePress: () => void;
  handleClose: () => void;
};

const CreateCommunityState = ({
  onAvatarPress,
  file,
  onChangeTeamName,
  teamName,
  onPaste,
  onCreatePress,
  handleClose,
}: CreateCommunityStateProps) => {
  return (
    <div className="view-body__wrapper">
      <div className="view-body">
        <div className="input-team-icon normal-button" onClick={onAvatarPress}>
          {file?.file ? (
            <div className="team-icon__wrapper">
              <img className="team-icon" alt="" src={file?.file} />
              {file?.loading && (
                <div className="attachment-loading">
                  <CircularProgress />
                </div>
              )}
            </div>
          ) : (
            <span>
              Add
              <br />
              icon
            </span>
          )}
          <img className="icon-camera" alt="" src={images.icCameraDark} />
        </div>
        <div className="input-team-item__container">
          <AppInput
            className="app-input-highlight"
            placeholder="Community name"
            onChange={onChangeTeamName}
            value={teamName}
            autoFocus
            onPaste={onPaste}
          />
        </div>
      </div>
      <div className="group-channel__bottom">
        <NormalButton title="Cancel" onPress={handleClose} type="normal" />
        <div style={{ width: 10 }} />
        <NormalButton title="Create" onPress={onCreatePress} type="main" />
      </div>
    </div>
  );
};

export default CreateCommunityState;
