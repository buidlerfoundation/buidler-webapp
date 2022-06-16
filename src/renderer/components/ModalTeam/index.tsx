import React, { useState, useRef, useEffect, useCallback } from "react";
import { Modal } from "@material-ui/core";
import Dropzone from "react-dropzone";
import toast from "react-hot-toast";
import { setCookie } from "renderer/common/Cookie";
import { AsyncKey } from "renderer/common/AppConfig";
import "./index.scss";
import { getUniqueId } from "../../helpers/GenerateUUID";
import api from "../../api";
import CreateCommunityState from "./CreateCommunityState";
import JoinCommunityState from "./JoinCommunityState";

type TabItemProps = {
  tab: { name: string };
  index: number;
  onClick: (index: number) => void;
  isActive: boolean;
};

const TabItem = ({ tab, index, onClick, isActive }: TabItemProps) => {
  const handleClick = useCallback(() => onClick(index), [index, onClick]);
  return (
    <div
      className={`tab-item ${isActive ? "active" : ""}`}
      onClick={handleClick}
    >
      <span>{tab.name}</span>
    </div>
  );
};

type ModalTeamProps = {
  open: boolean;
  handleClose: () => void;
  onCreateTeam: (teamData: any) => void;
  onAcceptTeam: () => void;
};

const ModalTeam = ({
  open,
  handleClose,
  onCreateTeam,
  onAcceptTeam,
}: ModalTeamProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const tabs = [{ name: "Create Community" }, { name: "Join Community" }];
  const [teamData, setTeamData] = useState({
    name: "",
  });
  const [link, setLink] = useState("");
  const [file, setFile] = useState<any>(null);
  const inputFileRef = useRef<any>();
  const generateId = useRef<string>("");
  const onAddFile = useCallback((fs: any) => {
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
    api
      .uploadFile(generateId.current, generateId.current, f)
      .then((res) => {
        if (res.statusCode === 200) {
          setFile((current: any) => ({
            ...current,
            loading: false,
            url: res.data?.file_url,
            id: res.data?.file.file_id,
          }));
        } else {
          setFile(null);
        }

        return null;
      })
      .catch((err) => console.log(err));
  }, []);
  const handleChangeTab = useCallback(
    (index: number) => setTabIndex(index),
    []
  );
  const handleAvatarPress = useCallback(
    () => inputFileRef.current?.click(),
    []
  );
  const handleChangeTeamName = useCallback(
    (e: any) => setTeamData({ name: e.target.value }),
    []
  );
  const onPaste = useCallback(
    (e: any) => {
      const fs = e.clipboardData.files;
      if (fs?.length > 0) {
        onAddFile(fs);
      }
    },
    [onAddFile]
  );

  useEffect(() => {
    generateId.current = "";
    setLink("");
    setFile(null);
    setTeamData({ name: "" });
    setTabIndex(0);
  }, [open]);
  const handleCreateCommunity = useCallback(() => {
    if (!teamData.name) return;
    onCreateTeam({
      ...teamData,
      teamIcon: file,
      teamId: generateId.current,
    });
  }, [file, onCreateTeam, teamData]);
  const handlePasteLink = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setLink(text);
  }, []);
  const handleJoinCommunity = useCallback(async () => {
    if (!link || !link.includes("invite.buidler")) {
      toast.error("Invalid invitation link");
      return;
    }
    const idx = link.lastIndexOf("/");
    const invitationId = link.substring(idx + 1);
    const res = await api.acceptInvitation(invitationId);
    if (res.statusCode === 200) {
      setCookie(AsyncKey.lastTeamId, res.data?.team_id);
      onAcceptTeam();
    }
  }, [link, onAcceptTeam]);
  const handleChangeLink = useCallback((e: any) => setLink(e.target.value), []);
  const handleChangeFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddFile(e.target.files);
      e.target.value = "";
    },
    [onAddFile]
  );
  const renderTab = useCallback(
    (tab: any, index: number) => {
      const isActive = index === tabIndex;
      return (
        <TabItem
          tab={tab}
          index={index}
          key={tab.name}
          isActive={isActive}
          onClick={handleChangeTab}
        />
      );
    },
    [handleChangeTab, tabIndex]
  );
  return (
    <Dropzone onDrop={onAddFile} multiple={false}>
      {({ getRootProps, getInputProps }) => (
        <Modal
          open={open}
          onClose={handleClose}
          className="team-modal"
          style={{ backgroundColor: "var(--color-backdrop)" }}
        >
          <div className="team-view__container" {...getRootProps()}>
            <div className="label-wrapper">{tabs.map(renderTab)}</div>
            {tabIndex === 0 && (
              <CreateCommunityState
                onAvatarPress={handleAvatarPress}
                onChangeTeamName={handleChangeTeamName}
                onPaste={onPaste}
                file={file}
                teamName={teamData?.name || ""}
                handleClose={handleClose}
                onCreatePress={handleCreateCommunity}
              />
            )}
            {tabIndex === 1 && (
              <JoinCommunityState
                onPaste={handlePasteLink}
                handleClose={handleClose}
                onJoinPress={handleJoinCommunity}
                link={link}
                onChange={handleChangeLink}
              />
            )}
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

export default ModalTeam;
