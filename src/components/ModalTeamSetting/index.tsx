import React, { useState, useRef, useEffect } from 'react';
import { Modal, CircularProgress } from '@material-ui/core';
import './index.scss';
import images from '../../common/images';
import AppInput from '../AppInput';
import ImageHelper from '../../common/ImageHelper';
import Dropzone from 'react-dropzone';
import { getUniqueId } from '../../helpers/GenerateUUID';
import api from '../../api';
import GlobalVariable from '../../services/GlobalVariable';
import DefaultSpaceIcon from '../DefaultSpaceIcon';

type ModalTeamSettingProps = {
  open: boolean;
  handleClose: () => void;
  team: any;
  updateTeam?: (teamId: string, body: any) => any;
  onDeleteClick: () => void;
};

const ModalTeamSetting = ({
  open,
  handleClose,
  team,
  updateTeam,
  onDeleteClick,
}: ModalTeamSettingProps) => {
  const [file, setFile] = useState<any>(null);
  const inputFileRef = useRef<any>();
  const generateId = useRef<string>('');
  const [teamName, setTeamName] = useState(team?.team_display_name);
  useEffect(() => {
    setTeamName(team?.team_display_name);
  }, [team?.team_display_name]);
  useEffect(() => {
    setFile(null);
    generateId.current = '';
  }, [open]);
  const onAddFile = (fs: any) => {
    if (fs == null) return;
    generateId.current = getUniqueId();
    const data = [...fs];
    const f = data?.[0];
    if (!f) return;
    const attachment = {
      file: URL.createObjectURL(f),
      randomId: Math.random(),
      loading: true,
      type: f.type,
      name: f.name,
    };
    setFile(attachment);
    api.uploadFile(team.team_id, generateId.current, f).then((res) => {
      if (res.statusCode === 200) {
        setFile((current: any) => ({
          ...current,
          loading: false,
          url: res.file_url,
          id: res.file.file_id,
        }));
        updateTeam?.(team.team_id, { team_icon: res.file_url });
      } else {
        setFile(null);
      }

      return null;
    });
  };
  const srcImage = () => {
    if (file) return file.file;
    return team?.team_icon
      ? ImageHelper.normalizeImage(team?.team_icon, team?.team_id, {
          w: 90,
          h: 90,
        })
      : images.icTeamDefault;
  };
  return (
    <Dropzone onDrop={onAddFile} multiple={false}>
      {({ getRootProps, getInputProps }) => (
        <Modal
          open={open}
          onClose={handleClose}
          className="team-setting-modal"
          style={{ backgroundColor: 'var(--color-backdrop)' }}
        >
          <div className="team-setting__container" {...getRootProps()}>
            <div className="left-side">
              <div className="group-setting-title" style={{ marginTop: 10 }}>
                <span>GENERAL</span>
              </div>
              <div className="setting-body">
                <div className="setting-item">
                  {team?.team_icon ? (
                    <img
                      className="team-avatar-small"
                      src={
                        file
                          ? file.file
                          : ImageHelper.normalizeImage(
                              team?.team_icon,
                              team?.team_id,
                              {
                                w: 25,
                                h: 25,
                              }
                            )
                      }
                      alt=""
                    />
                  ) : (
                    <DefaultSpaceIcon
                      name={
                        team?.team_display_name
                          ? team.team_display_name.charAt(0)
                          : ''
                      }
                      size={25}
                      borderRadius={12.5}
                      fontSize={14}
                      fontMarginTop={6}
                    />
                  )}
                  <span className="setting-label">Community profile</span>
                </div>
              </div>
            </div>
            <div className="body">
              <span className="modal-label">Community Profile</span>
              <div
                className="team-avatar__wrapper normal-button"
                onClick={() => inputFileRef.current?.click()}
              >
                {file || team?.team_icon ? (
                  <img className="team-avatar" src={srcImage()} alt="" />
                ) : (
                  <DefaultSpaceIcon
                    name={
                      team?.team_display_name
                        ? team.team_display_name.charAt(0)
                        : ''
                    }
                    size={90}
                    borderRadius={45}
                    fontSize={40}
                    fontMarginTop={10}
                  />
                )}
                <img className="icon-camera" alt="" src={images.icCameraDark} />
                {file?.loading && (
                  <div className="attachment-loading">
                    <CircularProgress />
                  </div>
                )}
              </div>
              <div className="input-wrapper">
                <AppInput
                  className="app-input"
                  placeholder="Enter your name"
                  onChange={(e) => {
                    setTeamName(e.target.value);
                  }}
                  value={teamName}
                  onBlur={() => {
                    GlobalVariable.isInputFocus = false;
                    updateTeam?.(team.team_id, { team_display_name: teamName });
                  }}
                />
              </div>
              <div className="delete__wrapper" onClick={onDeleteClick}>
                <img alt="" src={images.icSettingChannelDelete} />
                <span className="delete-text">Delete Community</span>
              </div>
            </div>
            <input
              {...getInputProps()}
              ref={inputFileRef}
              accept="image/*"
              onChange={(e: any) => {
                onAddFile(e.target.files);
                e.target.value = null;
              }}
            />
          </div>
        </Modal>
      )}
    </Dropzone>
  );
};

export default ModalTeamSetting;
