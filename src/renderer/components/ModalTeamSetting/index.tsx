import React, { useState, useRef, useEffect, useCallback } from "react";
import { Modal, CircularProgress } from "@material-ui/core";
import Dropzone from "react-dropzone";
import { Community } from "renderer/models";
import { updateTeam } from "renderer/actions/UserActions";
import "./index.scss";
import images from "../../common/images";
import AppInput from "../AppInput";
import ImageHelper from "../../common/ImageHelper";
import { getUniqueId } from "../../helpers/GenerateUUID";
import api from "../../api";
import GlobalVariable from "../../services/GlobalVariable";
import DefaultSpaceIcon from "../DefaultSpaceIcon";
import useAppDispatch from "renderer/hooks/useAppDispatch";

type ModalTeamSettingProps = {
  open: boolean;
  handleClose: () => void;
  team: Community | null;
  onDeleteClick: () => void;
};

const ModalTeamSetting = ({
  open,
  handleClose,
  team,
  onDeleteClick,
}: ModalTeamSettingProps) => {
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<any>(null);
  const inputFileRef = useRef<any>();
  const generateId = useRef<string>("");
  const [teamName, setTeamName] = useState(team?.team_display_name);
  useEffect(() => {
    setTeamName(team?.team_display_name);
  }, [team?.team_display_name]);
  useEffect(() => {
    setFile(null);
    generateId.current = "";
  }, [open]);
  const onAddFile = useCallback(
    (fs: any) => {
      if (fs == null || !team?.team_id) return;
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
      api
        .uploadFile(team.team_id, generateId.current, f)
        .then((res) => {
          if (res.statusCode === 200) {
            setFile((current: any) => ({
              ...current,
              loading: false,
              url: res.data?.file_url,
              id: res.data?.file.file_id,
            }));
            dispatch(
              updateTeam(team.team_id, { team_icon: res.data?.file_url })
            );
          } else {
            setFile(null);
          }
          return null;
        })
        .catch((err) => console.log(err));
    },
    [dispatch, team?.team_id]
  );
  const handleInputFileClick = useCallback(
    () => inputFileRef.current?.click(),
    []
  );
  const srcImage = useCallback(() => {
    if (file) return file.file;
    return team?.team_icon
      ? ImageHelper.normalizeImage(team?.team_icon, team?.team_id, {
          w: 90,
          h: 90,
        })
      : images.icTeamDefault;
  }, [file, team?.team_icon, team?.team_id]);
  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTeamName(e.target.value);
    },
    []
  );
  const handleInputNameBlur = useCallback(() => {
    if (!team?.team_id) return;
    GlobalVariable.isInputFocus = false;
    dispatch(updateTeam(team.team_id, { team_display_name: teamName }));
  }, [dispatch, team?.team_id, teamName]);
  const handleChangeFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddFile(e.target.files);
      e.target.value = "";
    },
    [onAddFile]
  );
  return (
    <Dropzone onDrop={onAddFile} multiple={false}>
      {({ getRootProps, getInputProps }) => (
        <Modal
          open={open}
          onClose={handleClose}
          className="team-setting-modal"
          style={{ backgroundColor: "var(--color-backdrop)" }}
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
                          : ""
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
                onClick={handleInputFileClick}
              >
                {file || team?.team_icon ? (
                  <img className="team-avatar" src={srcImage()} alt="" />
                ) : (
                  <DefaultSpaceIcon
                    name={
                      team?.team_display_name
                        ? team.team_display_name.charAt(0)
                        : ""
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
                  onChange={handleChangeName}
                  value={teamName}
                  onBlur={handleInputNameBlur}
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
              onChange={handleChangeFile}
            />
          </div>
        </Modal>
      )}
    </Dropzone>
  );
};

export default ModalTeamSetting;
